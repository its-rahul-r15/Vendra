'use strict';

const { Router } = require('express');
const controller = require('./admin.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/rbac.middleware');
const { ROLES } = require('../../common/constants/roles');

const router = Router();

router.use(authenticate, requireRole([ROLES.ADMIN]));

router.get('/dashboard', controller.getDashboard);
router.get('/users', controller.listUsers);
router.patch('/users/:userId', controller.updateUser);
router.get('/restaurants', controller.listRestaurants);
router.patch('/restaurants/:restaurantId', controller.updateRestaurant);
router.patch('/restaurants/:restaurantId/status', controller.updateRestaurant);

router.get('/audit-logs', controller.getAuditLogs);
router.get('/fees', controller.getFees);
router.put('/fees', controller.updateFees);
router.patch('/fees', controller.updateFees);

router.get('/categories', controller.listCategories);
router.post('/categories', controller.createCategory);
router.put('/categories/reorder', controller.reorderCategories);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);
router.post('/categories/purge-food', controller.purgeFoodCategories);

router.get('/orders', controller.listOrders);
router.patch('/orders/:id/status', controller.updateOrderStatus);
// NEW: Refund & Invoice routes
router.post('/orders/:id/refund', controller.processRefund);
router.post('/orders/:id/invoice', controller.generateInvoice);
router.post('/orders/:id/invoice/send', controller.sendInvoice);
router.get('/orders/:id/detail', controller.getOrderDetail);
router.get('/orders/:id/invoice/download', controller.downloadInvoice);
router.patch('/orders/bulk-status', controller.bulkUpdateOrderStatus);

router.post('/notifications', controller.sendNotification);
router.get('/notifications', controller.getNotificationHistory);

router.get('/home-config', controller.getHomeConfig);
router.put('/home-config', controller.updateHomeConfig);

// Hero Config routes
router.get('/hero-configs', controller.listHeroConfigs);
router.get('/hero-configs/public', controller.getPublicHeroConfigs);
router.post('/hero-configs', controller.createHeroConfig);
router.get('/hero-configs/:id', controller.getHeroConfig);
router.put('/hero-configs/:id', controller.updateHeroConfig);
router.delete('/hero-configs/:id', controller.deleteHeroConfig);
router.put('/hero-configs/reorder', controller.reorderHeroConfigs);
router.post('/hero-configs/seed', controller.seedDefaultHeroConfigs);

// Seller applications management
router.get('/seller-applications', async (req, res) => {
  const vendorService = require('../vendors/vendor.service');
  const { success } = require('../../common/response/apiResponse');
  const result = await vendorService.listApplications(req.query);
  return success(res, result);
});

router.post('/seller-applications/:id/approve', async (req, res) => {
  const vendorService = require('../vendors/vendor.service');
  const { success } = require('../../common/response/apiResponse');
  try {
    const vendor = await vendorService.approveVendor(req.params.id, req.user);
    return success(res, { vendor }, 'Vendor approved successfully');
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/seller-applications/:id/reject', async (req, res) => {
  const vendorService = require('../vendors/vendor.service');
  const { success } = require('../../common/response/apiResponse');
  try {
    const vendor = await vendorService.rejectVendor(req.params.id, req.user, req.body.reason);
    return success(res, { vendor }, 'Application rejected');
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

