'use strict';

const vendorService = require('./vendor.service');
const { formatResponse } = require('../../common/response');

class VendorController {
  async list(req, res) {
    const { vertical, type, isOpen, page, limit, lat, lng, radiusM } = req.query;
    const result = await vendorService.list({
      vertical,
      type,
      isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      lat,
      lng,
      radiusM,
    });
    return res.json(formatResponse(result));
  }

  async getById(req, res) {
    const vendor = await vendorService.getById(req.params.id);
    return res.json(formatResponse({ vendor }));
  }

  async create(req, res) {
    const vendor = await vendorService.create(req.body, req.user);
    return res.status(201).json(formatResponse({ vendor }));
  }

  async update(req, res) {
    const vendor = await vendorService.update(req.params.id, req.body, req.user);
    return res.json(formatResponse({ vendor }));
  }

  async pause(req, res) {
    const { pausedUntil, pauseReason } = req.body;
    const vendor = await vendorService.pauseVendor(req.params.id, {
      pausedUntil,
      pauseReason,
      actor: req.user,
    });
    return res.json(formatResponse({ vendor }));
  }

  async resume(req, res) {
    const vendor = await vendorService.resumeVendor(req.params.id, req.user);
    return res.json(formatResponse({ vendor }));
  }

  async applyAsSeller(req, res) {
    try {
      const vendor = await vendorService.applyAsSeller(req.user.id, req.body);
      return res.status(201).json(formatResponse({ vendor }, 'Application submitted successfully'));
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async listApplications(req, res) {
    const { status = 'pending', page, limit } = req.query;
    const result = await vendorService.listApplications({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return res.json(formatResponse(result));
  }

  async getMyApplication(req, res) {
    const vendor = await vendorService.getMyApplication(req.user.id);
    return res.json(formatResponse({ vendor }));
  }

  async approveVendor(req, res) {
    try {
      const vendor = await vendorService.approveVendor(req.params.id, req.user);
      return res.json(formatResponse({ vendor }, 'Vendor approved successfully'));
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async rejectVendor(req, res) {
    const { reason } = req.body;
    try {
      const vendor = await vendorService.rejectVendor(req.params.id, req.user, reason);
      return res.json(formatResponse({ vendor }, 'Vendor application rejected'));
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new VendorController();
