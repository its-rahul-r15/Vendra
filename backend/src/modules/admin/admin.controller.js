'use strict';

const adminService = require('./admin.service');
const { success } = require('../../common/response/apiResponse');

async function getDashboard(req, res) {
  const data = await adminService.getDashboardOverview();
  return success(res, data);
}

async function listUsers(req, res) {
  const result = await adminService.listUsers(req.query);
  return success(res, result);
}

async function updateUser(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const user = await adminService.updateUserStatus(req.user.id, req.params.userId, req.body, meta);
  return success(res, { user }, 'User updated successfully');
}

async function updateRestaurant(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const restaurant = await adminService.updateRestaurantStatus(
    req.user.id,
    req.params.restaurantId,
    req.body,
    meta
  );
  return success(res, { restaurant }, 'Restaurant status updated');
}

async function listRestaurants(req, res) {
  const restaurantService = require('../restaurants/restaurant.service');
  const result = await restaurantService.listRestaurants(req.query);
  return success(res, result);
}

async function getAuditLogs(req, res) {
  const result = await adminService.getAuditLogs(req.query);
  return success(res, result);
}

async function getFees(req, res) {
  const config = await adminService.getFeeConfig();
  return success(res, { config });
}

async function updateFees(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const config = await adminService.updateFeeConfig(req.user.id, req.body, meta);
  return success(res, { config }, 'Fee configuration updated successfully');
}

async function listCategories(req, res) {
  const onlyActive = req.query.onlyActive === 'true';
  const categories = await adminService.getCategories(onlyActive);
  return success(res, { categories }, 'Categories retrieved successfully');
}

async function createCategory(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const category = await adminService.createCategory(req.user.id, req.body, meta);
  return success(res, { category }, 'Category created successfully');
}

async function updateCategory(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const category = await adminService.updateCategory(req.user.id, req.params.id, req.body, meta);
  return success(res, { category }, 'Category updated successfully');
}

async function deleteCategory(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  await adminService.deleteCategory(req.user.id, req.params.id, meta);
  return success(res, null, 'Category deleted successfully');
}

async function purgeFoodCategories(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const result = await adminService.purgeFoodCategories(req.user.id, meta);
  return success(res, result, 'Food categories purged successfully');
}

async function reorderCategories(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const categories = await adminService.reorderCategories(req.user.id, req.body.items, meta);
  return success(res, { categories }, 'Categories reordered successfully');
}

async function sendNotification(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const result = await adminService.sendNotificationBroadcast(req.user.id, req.body, meta);
  return success(res, result, 'Notification sent successfully');
}

async function getNotificationHistory(req, res) {
  const result = await adminService.getNotificationHistory(req.query);
  return success(res, result);
}

async function listOrders(req, res) {
  const result = await adminService.listOrdersAdmin(req.query);
  return success(res, result, 'Admin orders retrieved');
}

async function updateOrderStatus(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const order = await adminService.updateOrderStatusAdmin(req.user.id, req.params.id, req.body, meta);
  return success(res, { order }, 'Order status updated successfully');
}

// ===== NEW: Refund & Invoice Controllers =====

async function processRefund(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const { amountPaise, reason, reasonCode, refundTo, notes } = req.body;
  const order = await adminService.processRefundAdmin(req.user.id, req.params.id, { amountPaise, reason, reasonCode, refundTo, notes }, meta);
  return success(res, { order }, 'Refund processed successfully');
}

async function generateInvoice(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const { gstNumber } = req.body;
  const order = await adminService.generateInvoiceAdmin(req.user.id, req.params.id, { gstNumber }, meta);
  return success(res, { order }, 'Invoice generated successfully');
}

async function sendInvoice(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const order = await adminService.sendInvoiceAdmin(req.user.id, req.params.id, meta);
  return success(res, { order }, 'Invoice sent successfully');
}

async function downloadInvoice(req, res) {
  try {
    const adminService = require('./admin.service');
    const invoicePdfService = require('../../services/invoicePdf.service');
    const order = await adminService.getOrderDetailAdmin(req.params.id);
    
    if (!order.invoice || order.invoice.status === 'NOT_GENERATED') {
      return res.status(400).json({ success: false, message: 'Invoice not generated for this order' });
    }
    
    const pdfBuffer = await invoicePdfService.generateInvoicePdf(order);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.invoice.invoiceNumber || order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
  }
}

async function getOrderDetail(req, res) {
  const order = await adminService.getOrderDetailAdmin(req.params.id);
  return success(res, { order }, 'Order detail retrieved');
}

async function bulkUpdateOrderStatus(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const { orderIds, status, reason } = req.body;
  const result = await adminService.bulkUpdateOrderStatusAdmin(req.user.id, orderIds, status, reason, meta);
  return success(res, result, `Bulk update completed: ${result.success.length} success, ${result.failed.length} failed`);
}

async function getHomeConfig(req, res) {
  const feedService = require('../settings/feed.service');
  const config = await feedService.getHomeConfig();
  return success(res, { config }, 'Home configuration retrieved');
}

async function updateHomeConfig(req, res) {
  const feedService = require('../settings/feed.service');
  const userId = req.user?.id || req.user?._id;
  const config = await feedService.updateHomeConfig(req.body, userId);
  return success(res, { config }, 'Home configuration updated successfully');
}

// ===== HERO CONFIG CONTROLLERS =====

async function listHeroConfigs(req, res) {
  const result = await adminService.listHeroConfigs(req.query);
  return success(res, result, 'Hero configs retrieved');
}

async function getHeroConfig(req, res) {
  const config = await adminService.getHeroConfig(req.params.id);
  return success(res, { config }, 'Hero config retrieved');
}

async function createHeroConfig(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const config = await adminService.createHeroConfig(req.user.id, req.body, meta);
  return success(res, { config }, 'Hero config created successfully');
}

async function updateHeroConfig(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const config = await adminService.updateHeroConfig(req.user.id, req.params.id, req.body, meta);
  return success(res, { config }, 'Hero config updated successfully');
}

async function deleteHeroConfig(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  await adminService.deleteHeroConfig(req.user.id, req.params.id, meta);
  return success(res, null, 'Hero config deleted successfully');
}

async function reorderHeroConfigs(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const { items } = req.body;
  const result = await adminService.reorderHeroConfigs(req.user.id, items, meta);
  return success(res, result, 'Hero configs reordered');
}

async function seedDefaultHeroConfigs(req, res) {
  const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
  const result = await adminService.seedDefaultHeroConfigs(req.user.id, meta);
  return success(res, result, 'Default hero configs seeded');
}

async function getPublicHeroConfigs(req, res) {
  const configs = await adminService.getPublicHeroConfigs();
  return success(res, { configs }, 'Public hero configs retrieved');
}

module.exports = {
  getDashboard,
  listUsers,
  updateUser,
  listRestaurants,
  updateRestaurant,
  getAuditLogs,
  getFees,
  updateFees,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  purgeFoodCategories,
  reorderCategories,
  sendNotification,
  getNotificationHistory,
  listOrders,
  updateOrderStatus,
  // New admin order functions
  processRefund,
  generateInvoice,
  sendInvoice,
  downloadInvoice,
  getOrderDetail,
  bulkUpdateOrderStatus,
  getHomeConfig,
  updateHomeConfig,
  // Hero config functions
  listHeroConfigs,
  getHeroConfig,
  createHeroConfig,
  updateHeroConfig,
  deleteHeroConfig,
  reorderHeroConfigs,
  seedDefaultHeroConfigs,
  getPublicHeroConfigs,
};
