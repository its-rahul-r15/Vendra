'use strict';

const catalogService = require('./catalog.service');
const { formatResponse } = require('../../common/response');

class CatalogController {
  async getCategories(req, res) {
    const { vertical, includeInactive } = req.query;
    const categories = await catalogService.getCategories({ vertical, includeInactive: includeInactive === 'true' });
    return res.json(formatResponse({ categories }));
  }

  async createCategory(req, res) {
    const category = await catalogService.createCategory(req.body, req.user);
    return res.status(201).json(formatResponse({ category }));
  }

  async search(req, res) {
    const { vertical, q, vendorId, categoryId, page, limit, sort } = req.query;
    const result = await catalogService.search({
      vertical,
      q,
      vendorId,
      categoryId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort,
    });
    return res.json(formatResponse(result));
  }

  async getListing(req, res) {
    const listing = await catalogService.getListing(req.params.listingId);
    return res.json(formatResponse({ listing }));
  }

  async listCommerceProducts(req, res) {
    const listings = await catalogService.listCommerceProducts({ includeUnavailable: req.query.includeUnavailable === 'true' });
    return res.json(formatResponse({ listings }));
  }

  async createCommerceProduct(req, res) {
    const listing = await catalogService.createCommerceProduct(req.body, req.user);
    return res.status(201).json(formatResponse({ listing }));
  }

  async updateCommerceProduct(req, res) {
    const listing = await catalogService.updateCommerceProduct(req.params.listingId, req.body, req.user);
    return res.json(formatResponse({ listing }));
  }

  async deleteCommerceProduct(req, res) {
    await catalogService.deleteCommerceProduct(req.params.listingId, req.user);
    return res.json(formatResponse({ success: true }));
  }

  async getCategoriesTree(req, res) {
    const categories = await catalogService.getCategoriesTree();
    return res.json(formatResponse({ categories }));
  }

  async createCategory(req, res) {
    const category = await catalogService.createCategory(req.body, req.user);
    return res.status(201).json(formatResponse({ category }));
  }

  async updateCategory(req, res) {
    try {
      const category = await catalogService.updateCategory(req.params.id, req.body, req.user);
      return res.json(formatResponse({ category }));
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const result = await catalogService.deleteCategory(req.params.id, req.user);
      return res.json(formatResponse(result));
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // Public hero configs for home page
  async getPublicHeroConfigs(req, res) {
    try {
      const HeroConfig = require('../admin/heroConfig.model');
      const configs = await HeroConfig.getActiveThemes().lean();

      const publicConfigs = configs.map(config => ({
        _id: config._id,
        key: config.key,
        name: config.name,
        themeName: config.themeName,
        radialGlow: config.radialGlow,
        heroPng: config.heroPng,
        options: config.options,
        matchRules: config.matchRules,
        sortOrder: config.sortOrder,
      }));

      return res.json(formatResponse({ configs: publicConfigs }));
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch hero configs' });
    }
  }
}

module.exports = new CatalogController();