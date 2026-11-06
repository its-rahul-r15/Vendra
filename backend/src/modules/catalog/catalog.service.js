'use strict';

const CatalogItem = require('./catalogItem.model');
const VendorListing = require('./vendorListing.model');
const Category = require('./category.model');
const Vendor = require('../vendors/vendor.model');
const { VERTICALS, VENDOR_TYPES, VENDOR_OWNERSHIP } = require('../../common/constants/orderStatuses');
const { BusinessError, NotFoundError, ValidationError } = require('../../common/errors');
const ERROR_CODES = require('../../common/constants/errorCodes');
const auditService = require('../audit');
const outboxService = require('../outbox');

class CatalogService {
  async getCategories({ vertical = null, includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    if (vertical) {
      filter.$or = [{ vertical }, { vertical: 'both' }];
    }
    return Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();
  }

  async getCategoriesTree({ vertical = null } = {}) {
    const filter = { isActive: true };
    if (vertical) {
      filter.$or = [{ vertical }, { vertical: 'both' }];
    }
    const all = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();

    // Build tree: parent categories with nested subcategories
    const parents = all.filter(c => !c.parentId);
    const children = all.filter(c => c.parentId);

    return parents.map(parent => ({
      ...parent,
      subcategories: children.filter(
        child => child.parentId && child.parentId.toString() === parent._id.toString()
      ),
    }));
  }

  async getListing(listingId) {
    const listing = await VendorListing.findOne({ _id: listingId, vertical: VERTICALS.COMMERCE, isAvailable: true })
      .populate({ path: 'itemId', match: { status: 'active' }, populate: { path: 'categoryId', select: 'name slug image' } })
      .populate('vendorId', 'name images')
      .lean();
    if (!listing?.itemId) throw new NotFoundError('Product not found', ERROR_CODES.NOT_FOUND);
    return listing;
  }

  async listCommerceProducts({ includeUnavailable = false } = {}) {
    const filter = { vertical: VERTICALS.COMMERCE };
    if (!includeUnavailable) filter.isAvailable = true;
    return VendorListing.find(filter)
      .populate({ path: 'itemId', match: includeUnavailable ? {} : { status: 'active' }, populate: { path: 'categoryId', select: 'name slug image' } })
      .populate('vendorId', 'name images')
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean()
      .then((listings) => listings.filter((listing) => listing.itemId));
  }

  async createCommerceProduct(data, actor) {
    if (!data.name?.trim() || !data.categoryId || !Number.isFinite(Number(data.pricePaise)) || Number(data.pricePaise) <= 0) {
      throw new ValidationError('Product name, category and a price greater than zero are required');
    }
    const category = await Category.findOne({ _id: data.categoryId, vertical: VERTICALS.COMMERCE, isActive: true });
    if (!category) throw new ValidationError('Choose an active marketplace category');
    if (Number(data.stock ?? 0) < 0) throw new ValidationError('Stock cannot be negative');
    const vendor = await this.getOrCreateCommerceVendor();
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
    const item = await CatalogItem.create({
      name: data.name,
      slug,
      kind: 'sku',
      vertical: VERTICALS.COMMERCE,
      scope: 'vendor',
      vendorId: vendor._id,
      categoryId: data.categoryId,
      description: data.description || '',
      media: data.image ? [{ url: data.image, type: 'image', isPrimary: true }] : [],
      tags: data.tags || [],
      searchTerms: data.tags || [],
      attributes: { unit: data.unit || 'piece', barcode: data.sku || undefined },
      status: data.isActive === false ? 'draft' : 'active',
      tax: { gstPercent: Number(data.gstPercent ?? 18), hsn: data.hsn || undefined },
      createdBy: { userId: actor.id, role: actor.role },
    });
    const listing = await VendorListing.create({
      vendorId: vendor._id,
      itemId: item._id,
      vertical: VERTICALS.COMMERCE,
      pricePaise: Number(data.pricePaise),
      mrpPaise: Number(data.mrpPaise || data.pricePaise),
      stock: { track: true, available: Number(data.stock ?? 0), reserved: 0 },
      isAvailable: data.isActive !== false && Number(data.stock ?? 0) > 0,
    });
    await auditService.log({ actor, action: 'COMMERCE_PRODUCT_CREATED', entity: { type: 'VendorListing', id: listing._id }, after: listing.toObject() });
    return { ...listing.toObject(), itemId: item.toObject(), vendorId: vendor.toObject() };
  }

  async updateCommerceProduct(listingId, data, actor) {
    if (data.pricePaise !== undefined && (!Number.isFinite(Number(data.pricePaise)) || Number(data.pricePaise) <= 0)) {
      throw new ValidationError('Price must be greater than zero');
    }
    if (data.stock !== undefined && (!Number.isFinite(Number(data.stock)) || Number(data.stock) < 0)) {
      throw new ValidationError('Stock cannot be negative');
    }
    if (data.categoryId !== undefined && !await Category.exists({ _id: data.categoryId, vertical: VERTICALS.COMMERCE, isActive: true })) {
      throw new ValidationError('Choose an active marketplace category');
    }
    const listing = await VendorListing.findOne({ _id: listingId, vertical: VERTICALS.COMMERCE }).populate('itemId');
    if (!listing?.itemId) throw new NotFoundError('Product not found', ERROR_CODES.NOT_FOUND);
    const item = listing.itemId;
    for (const field of ['name', 'description', 'categoryId', 'status']) {
      if (data[field] !== undefined) item[field] = data[field];
    }
    if (data.image !== undefined) item.media = data.image ? [{ url: data.image, type: 'image', isPrimary: true }] : [];
    if (data.tags !== undefined) {
      item.tags = data.tags;
      item.searchTerms = data.tags;
    }
    if (data.unit !== undefined) item.attributes.unit = data.unit;
    if (data.sku !== undefined) item.attributes.barcode = data.sku;
    if (data.gstPercent !== undefined) item.tax.gstPercent = Number(data.gstPercent);
    if (data.hsn !== undefined) item.tax.hsn = data.hsn || undefined;
    if (data.isActive !== undefined) item.status = data.isActive ? 'active' : 'archived';
    await item.save();
    if (data.pricePaise !== undefined) listing.pricePaise = Number(data.pricePaise);
    if (data.mrpPaise !== undefined) listing.mrpPaise = Number(data.mrpPaise);
    if (data.stock !== undefined) listing.stock.available = Number(data.stock);
    if (data.isActive !== undefined) listing.isAvailable = Boolean(data.isActive) && listing.stock.available > 0;
    else if (data.stock !== undefined && listing.stock.available <= 0) listing.isAvailable = false;
    listing.version += 1;
    await listing.save();
    await auditService.log({ actor, action: 'COMMERCE_PRODUCT_UPDATED', entity: { type: 'VendorListing', id: listing._id }, after: listing.toObject() });
    return listing;
  }

  async deleteCommerceProduct(listingId, actor) {
    const listing = await VendorListing.findOne({ _id: listingId, vertical: VERTICALS.COMMERCE }).populate('itemId');
    if (!listing?.itemId) throw new NotFoundError('Product not found', ERROR_CODES.NOT_FOUND);
    listing.isAvailable = false;
    listing.stock.available = 0;
    await listing.save();
    listing.itemId.status = 'archived';
    await listing.itemId.save();
    await auditService.log({ actor, action: 'COMMERCE_PRODUCT_ARCHIVED', entity: { type: 'VendorListing', id: listing._id } });
    return { archived: true };
  }

  async getOrCreateCommerceVendor() {
    let vendor = await Vendor.findOne({ vertical: VERTICALS.COMMERCE, ownership: VENDOR_OWNERSHIP.PLATFORM });
    if (vendor) return vendor;
    try {
      vendor = await Vendor.create({
        name: 'Marketplace Store',
        slug: 'marketplace-store',
        type: VENDOR_TYPES.RETAIL_STORE,
        vertical: VERTICALS.COMMERCE,
        ownership: VENDOR_OWNERSHIP.PLATFORM,
        location: { type: 'Point', coordinates: [77.209, 28.6139] },
        address: { line1: 'Marketplace Fulfilment Centre', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
        images: {},
        isActive: true,
        isOpen: true,
      });
      return vendor;
    } catch (error) {
      if (error.code === 11000) {
        vendor = await Vendor.findOne({ vertical: VERTICALS.COMMERCE, ownership: VENDOR_OWNERSHIP.PLATFORM });
        if (vendor) return vendor;
      }
      throw error;
    }
  }

  async updateCategory(categoryId, data, actor = null) {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error('Category not found');
    const before = category.toObject();
    Object.assign(category, data);
    await category.save();
    if (actor) {
      await auditService.log({
        actor,
        action: 'CATEGORY_UPDATED',
        entity: { type: 'Category', id: category._id },
        before,
        after: category.toObject(),
      });
    }
    return category;
  }

  async deleteCategory(categoryId, actor = null) {
    const existing = await Category.findById(categoryId);
    if (!existing) throw new Error('Category not found');
    // Keep commerce products linked to their category when an admin removes it from the storefront.
    const category = existing.vertical === VERTICALS.COMMERCE
      ? await Category.findByIdAndUpdate(categoryId, { isActive: false }, { new: true })
      : await Category.findByIdAndDelete(categoryId);
    if (!category) throw new Error('Category not found');
    if (category.vertical !== VERTICALS.COMMERCE) {
      await Category.updateMany({ parentId: categoryId }, { $set: { parentId: null } });
    }
    if (actor) {
      await auditService.log({
        actor,
        action: 'CATEGORY_DELETED',
        entity: { type: 'Category', id: categoryId },
        before: category.toObject(),
      });
    }
    return { deleted: true };
  }

  async createCategory(data, actor = null) {
    const category = new Category(data);
    await category.save();

    if (actor) {
      await auditService.log({
        actor,
        action: 'CATEGORY_CREATED',
        entity: { type: 'Category', id: category._id },
        after: category.toObject(),
      });
    }

    return category;
  }

  async createMasterItem(data, actor) {
    const item = new CatalogItem({
      ...data,
      scope: 'master',
      createdBy: { userId: actor.id, role: actor.role },
    });
    await item.save();

    await auditService.log({
      actor,
      action: 'MASTER_ITEM_CREATED',
      entity: { type: 'CatalogItem', id: item._id },
      after: item.toObject(),
    });

    return item;
  }

  async createVendorItem(data, actor) {
    const item = new CatalogItem({
      ...data,
      scope: 'vendor',
      createdBy: { userId: actor.id, role: actor.role },
    });
    await item.save();

    // Create default listing for the vendor
    const listing = new VendorListing({
      vendorId: data.vendorId,
      itemId: item._id,
      vertical: data.vertical,
      pricePaise: data.pricePaise,
      mrpPaise: data.mrpPaise,
      variants: data.variants || [],
      addonGroups: data.addonGroups || [],
      stock: data.stock || { track: false, available: 0, reserved: 0 },
      isAvailable: data.isAvailable !== false,
    });
    await listing.save();

    await auditService.log({
      actor,
      action: 'VENDOR_ITEM_CREATED',
      entity: { type: 'CatalogItem', id: item._id },
      after: { item: item.toObject(), listing: listing.toObject() },
    });

    return { item, listing };
  }

  async createListing(data, actor) {
    const listing = new VendorListing(data);
    await listing.save();

    await auditService.log({
      actor,
      action: 'VENDOR_LISTING_CREATED',
      entity: { type: 'VendorListing', id: listing._id },
      after: listing.toObject(),
    });

    await outboxService.record({
      eventName: 'catalog.item_listed.v1',
      aggregateType: 'VendorListing',
      aggregateId: listing._id,
      payload: { vendorId: listing.vendorId, itemId: listing.itemId },
    });

    return listing;
  }

  async updateListing(listingId, updates, actor, expectedVersion = null) {
    const query = { _id: listingId };
    if (expectedVersion !== null) {
      query.version = expectedVersion;
    }

    const existing = await VendorListing.findById(listingId);
    if (!existing) throw new NotFoundError('Listing not found', ERROR_CODES.NOT_FOUND);

    // Check locked fields if actor is not super_admin/admin
    if (actor.role !== 'super_admin' && actor.role !== 'admin' && existing.lockedFields?.length) {
      for (const field of existing.lockedFields) {
        if (updates[field] !== undefined && updates[field] !== existing[field]) {
          throw new BusinessError(`Field '${field}' is regulated and locked by platform admin`, ERROR_CODES.FORBIDDEN);
        }
      }
    }

    const updated = await VendorListing.findOneAndUpdate(
      query,
      {
        $set: updates,
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updated && expectedVersion !== null) {
      throw new BusinessError(
        'Concurrent edit conflict. The item was modified by another user.',
        ERROR_CODES.STALE_VERSION,
        409
      );
    }

    await auditService.log({
      actor,
      action: 'LISTING_UPDATED',
      entity: { type: 'VendorListing', id: listingId },
      before: existing.toObject(),
      after: updated.toObject(),
    });

    return updated;
  }

  async search({ vertical, q, vendorId, categoryId, page = 1, limit = 20, sort = 'newest' }) {
    const filter = { isAvailable: true };
    if (vertical) filter.vertical = vertical;
    if (vendorId) filter.vendorId = vendorId;

    const skip = (page - 1) * limit;

    const sortQuery = sort === 'price_asc'
      ? { pricePaise: 1, createdAt: -1 }
      : sort === 'price_desc'
        ? { pricePaise: -1, createdAt: -1 }
        : { sortOrder: 1, createdAt: -1 };
    const listings = await VendorListing.find(filter)
      .populate({
        path: 'itemId',
        match: {
          status: 'active',
          ...(categoryId ? { categoryId } : {}),
          ...(q ? { $text: { $search: q } } : {}),
        },
        populate: { path: 'categoryId', select: 'name slug image' },
      })
      .populate('vendorId', 'name images')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out listings where populated itemId is null (e.g. didn't match search/status)
    const validListings = listings.filter((l) => l.itemId != null);

    return { listings: validListings, page, limit };
  }
}

module.exports = new CatalogService();
