'use strict';

const Vendor = require('./vendor.model');
const { NotFoundError, BusinessError } = require('../../common/errors');
const ERROR_CODES = require('../../common/constants/errorCodes');
const auditService = require('../audit');

class VendorService {
  async getById(vendorId) {
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) throw new NotFoundError(`Vendor not found: ${vendorId}`, ERROR_CODES.NOT_FOUND);
    return vendor;
  }

  async list({ vertical, type, isOpen, isActive = true, page = 1, limit = 20, lat, lng, radiusM = 10000 }) {
    const query = { isActive };
    if (vertical) query.vertical = vertical;
    if (type) query.type = type;
    if (typeof isOpen === 'boolean') query.isOpen = isOpen;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radiusM, 10),
        },
      };
    }

    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      Vendor.find(query).skip(skip).limit(limit).lean(),
      Vendor.countDocuments(query),
    ]);

    return { vendors, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data, actor = null) {
    const vendor = new Vendor(data);
    await vendor.save();

    if (actor) {
      await auditService.log({
        actor,
        action: 'VENDOR_CREATED',
        entity: { type: 'Vendor', id: vendor._id },
        after: vendor.toObject(),
      });
    }

    return vendor;
  }

  async update(vendorId, updates, actor = null, reason = null) {
    const existing = await Vendor.findById(vendorId);
    if (!existing) throw new NotFoundError('Vendor not found', ERROR_CODES.NOT_FOUND);

    const before = existing.toObject();
    Object.assign(existing, updates);
    await existing.save();

    if (actor) {
      await auditService.log({
        actor,
        action: 'VENDOR_UPDATED',
        entity: { type: 'Vendor', id: vendorId },
        before,
        after: existing.toObject(),
        reason,
      });
    }

    return existing;
  }

  async pauseVendor(vendorId, { pausedUntil, pauseReason, actor }) {
    return this.update(
      vendorId,
      {
        isOpen: false,
        pausedUntil: pausedUntil ? new Date(pausedUntil) : null,
        pauseReason,
      },
      actor,
      `Vendor paused: ${pauseReason}`
    );
  }

  async resumeVendor(vendorId, actor) {
    return this.update(
      vendorId,
      {
        isOpen: true,
        pausedUntil: null,
        pauseReason: null,
      },
      actor,
      'Vendor resumed'
    );
  }

  async applyAsSeller(userId, applicationData) {
    const User = require('../users/user.model');

    // Check user is not already a merchant
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (['merchant_owner', 'restaurant_owner'].includes(user.role)) {
      throw new Error('You are already registered as a seller');
    }

    // Check no pending application already exists
    const existingApp = await Vendor.findOne({ ownerId: userId, 'approval.status': 'pending' });
    if (existingApp) {
      throw new Error('You already have a pending application');
    }

    const { businessName, businessType, ownerName, businessPhone, businessEmail,
            gstNumber, fssaiNumber, businessAddress } = applicationData;

    // Determine vertical from businessType
    const verticalMap = { restaurant: 'food', grocery: 'grocery', both: 'food' };
    const vertical = verticalMap[businessType] || 'food';
    const type = businessType === 'grocery' ? 'grocery' : 'restaurant';

    // Create a slug
    const slug = (businessName || 'seller')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now();

    const vendor = new Vendor({
      name: businessName,
      slug,
      type,
      vertical,
      ownerId: userId,
      location: { type: 'Point', coordinates: [0, 0] }, // placeholder until approved
      address: {
        line1: businessAddress?.line1 || 'TBD',
        city: businessAddress?.city || 'TBD',
        state: businessAddress?.state || 'TBD',
        pincode: businessAddress?.pincode || '000000',
      },
      isActive: false,
      isOpen: false,
      approval: { status: 'pending' },
      sellerApplication: {
        businessName, businessType, ownerName, businessPhone, businessEmail,
        gstNumber, fssaiNumber, businessAddress, submittedAt: new Date(),
      },
    });

    await vendor.save();

    await auditService.log({
      actor: { id: userId, role: 'customer' },
      action: 'SELLER_APPLICATION_SUBMITTED',
      entity: { type: 'Vendor', id: vendor._id },
      after: vendor.toObject(),
    });

    return vendor;
  }

  async listApplications({ status = 'pending', page = 1, limit = 20 } = {}) {
    const filter = status === 'all' ? {} : { 'approval.status': status };
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('ownerId', 'name phone email')
        .lean(),
      Vendor.countDocuments(filter),
    ]);
    return { vendors, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyApplication(userId) {
    return Vendor.findOne({ ownerId: userId }).sort({ createdAt: -1 }).lean();
  }

  async approveVendor(vendorId, adminUser) {
    const Notification = require('../notifications/notification.model');
    const User = require('../users/user.model');

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');
    if (vendor.approval.status === 'approved') throw new Error('Vendor already approved');

    vendor.approval.status = 'approved';
    vendor.approval.reviewedBy = adminUser.id;
    vendor.approval.reviewedAt = new Date();
    vendor.isActive = true;
    await vendor.save();

    // Upgrade user role to merchant_owner
    await User.findByIdAndUpdate(vendor.ownerId, {
      role: 'merchant_owner',
      restaurantId: vendor._id,
    });

    // Send notification to user
    try {
      await Notification.create({
        user: vendor.ownerId,
        title: 'Application Approved! 🎉',
        body: `Congratulations! Your seller application for "${vendor.name}" has been approved. You can now access your seller dashboard.`,
        type: 'seller_approved',
        data: { vendorId: String(vendor._id) },
      });
    } catch (err) {}

    await auditService.log({
      actor: adminUser,
      action: 'SELLER_APPLICATION_APPROVED',
      entity: { type: 'Vendor', id: vendorId },
      after: vendor.toObject(),
    });

    return vendor;
  }

  async rejectVendor(vendorId, adminUser, reason) {
    const Notification = require('../notifications/notification.model');

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new Error('Vendor not found');

    vendor.approval.status = 'rejected';
    vendor.approval.reviewedBy = adminUser.id;
    vendor.approval.reviewedAt = new Date();
    vendor.approval.adminNote = reason || 'Application did not meet requirements';
    await vendor.save();

    // Notify user
    try {
      await Notification.create({
        user: vendor.ownerId,
        title: 'Application Update',
        body: `Your seller application was not approved. Reason: ${reason || 'Did not meet requirements'}. You can re-apply with updated information.`,
        type: 'seller_rejected',
        data: { vendorId: String(vendor._id), reason },
      });
    } catch (err) {}

    await auditService.log({
      actor: adminUser,
      action: 'SELLER_APPLICATION_REJECTED',
      entity: { type: 'Vendor', id: vendorId },
      after: vendor.toObject(),
      reason,
    });

    return vendor;
  }
}

module.exports = new VendorService();
