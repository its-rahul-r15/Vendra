'use strict';

const PDFDocument = require('pdfkit');

/**
 * Simple inline formatter to avoid dependency on frontend utils
 */
function formatINRFromPaise(paise) {
  if (!paise || paise === 0) return '₹0';
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

async function generateInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      drawHeader(doc, order);
      drawAddresses(doc, order);
      drawInvoiceDetails(doc, order);
      const itemsEndY = drawItemsTable(doc, order);
      const taxEndY = drawTaxBreakdown(doc, order, itemsEndY);
      drawTotals(doc, order, taxEndY);
      drawFooter(doc, order);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawHeader(doc, order) {
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#990024').text('Vendra', 50, 50);
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('E-commerce Platform', 50, 78);
  doc.fontSize(18).font('Helvetica-Bold').fillColor('#1a1a1a').text('INVOICE', 450, 50, { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Invoice #: ${order.invoice?.invoiceNumber || order.orderNumber}`, 450, 75, { align: 'right' });
  const invoiceDate = order.invoice?.generatedAt ? new Date(order.invoice.generatedAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  doc.text(`Date: ${invoiceDate}`, 450, 90, { align: 'right' });
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#e0e0e0').stroke();
}

function drawAddresses(doc, order) {
  let y = 130;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a1a').text('BILL TO:', 50, y);
  doc.fontSize(9).font('Helvetica').fillColor('#444').text(order.user?.name || order.customerName || 'N/A', 50, y + 15).text(order.user?.phone || order.customerPhone || 'N/A', 50, y + 27).text(order.user?.email || 'N/A', 50, y + 39);
  if (order.deliveryAddress) { doc.text(`${order.deliveryAddress.line1 || ''}`, 50, y + 51).text(`${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} ${order.deliveryAddress.pincode || ''}`, 50, y + 63); }
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a1a').text('SHIP TO:', 300, y);
  doc.fontSize(9).font('Helvetica').fillColor('#444').text(order.restaurant?.name || order.vendorId?.name || order.restaurantName || 'N/A', 300, y + 15);
  if (order.restaurant?.address) { doc.text(`${order.restaurant.address.line1 || ''}`, 300, y + 27).text(`${order.restaurant.address.city || ''}, ${order.restaurant.address.state || ''} ${order.restaurant.address.pincode || ''}`, 300, y + 39); }
}

function drawInvoiceDetails(doc, order) {
  let y = 210;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff').rect(50, y, 495, 22).fill('#990024');
  doc.fillColor('#fff').text('SR', 55, y + 5).text('DESCRIPTION', 100, y + 5).text('QTY', 300, y + 5, { align: 'center' }).text('UNIT PRICE', 360, y + 5, { align: 'center' }).text('AMOUNT', 480, y + 5, { align: 'right' });
}

function drawItemsTable(doc, order) {
  let y = 232;
  const items = order.items || [];
  items.forEach((item, idx) => {
    const itemName = item.menuItem?.name || item.itemId?.name || item.name || item.product?.name || 'Item';
    const itemPrice = item.pricePaise || item.price || item.menuItem?.price || item.itemId?.price || 0;
    const itemQty = item.quantity || item.qty || 1;
    const amount = itemPrice * itemQty;
    if (idx % 2 === 0) { doc.rect(50, y, 495, 20).fill('#fafafa'); }
    doc.fontSize(8).font('Helvetica').fillColor('#333').text(String(idx + 1), 55, y + 5).text(itemName.substring(0, 40), 100, y + 5, { width: 190 }).text(String(itemQty), 300, y + 5, { align: 'center', width: 50 }).text(`₹${(itemPrice / 100).toFixed(2)}`, 360, y + 5, { align: 'center', width: 100 }).text(`₹${(amount / 100).toFixed(2)}`, 480, y + 5, { align: 'right', width: 60 });
    y += 20;
  });
  return y;
}

function drawTaxBreakdown(doc, order, itemsEndY) {
  let y = itemsEndY + 10;
  const breakdown = order.invoice?.gstBreakdown || {};
  const cgst = breakdown.cgstPaise || 0;
  const sgst = breakdown.sgstPaise || 0;
  const igst = breakdown.igstPaise || 0;
  const totalTax = breakdown.totalTaxPaise || (cgst + sgst + igst);
  doc.fontSize(9).font('Helvetica').fillColor('#333').text('Subtotal:', 350, y, { width: 100, align: 'right' }).text(`₹${((order.pricing?.totalPaise || order.totalAmount * 100 || 0) - totalTax) / 100}`, 480, y, { width: 60, align: 'right' });
  y += 18;
  if (cgst > 0) { doc.text('CGST (9%):', 350, y, { width: 100, align: 'right' }).text(`₹${(cgst / 100).toFixed(2)}`, 480, y, { width: 60, align: 'right' }); y += 18; }
  if (sgst > 0) { doc.text('SGST (9%):', 350, y, { width: 100, align: 'right' }).text(`₹${(sgst / 100).toFixed(2)}`, 480, y, { width: 60, align: 'right' }); y += 18; }
  if (igst > 0) { doc.text('IGST (18%):', 350, y, { width: 100, align: 'right' }).text(`₹${(igst / 100).toFixed(2)}`, 480, y, { width: 60, align: 'right' }); y += 18; }
  doc.moveTo(350, y + 5).lineTo(540, y + 5).strokeColor('#990024').lineWidth(1).stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#990024').text('TOTAL:', 350, y + 10, { width: 100, align: 'right' }).text(`₹${(order.pricing?.totalPaise || order.totalAmount * 100 || 0) / 100}`, 480, y + 10, { width: 60, align: 'right' });
  return y + 35;
}

function drawTotals(doc, order, taxEndY) {
  let y = taxEndY + 20;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a1a').text('Payment Information:', 50, y);
  y += 20;
  doc.fontSize(9).font('Helvetica').fillColor('#444').text(`Payment Method: ${order.paymentMethod || order.payment?.method || 'ONLINE'}`, 50, y).text(`Payment Status: ${order.payment?.status || 'PENDING'}`, 50, y + 15);
  if (order.invoice?.gstNumber) { doc.text(`GSTIN: ${order.invoice.gstNumber}`, 50, y + 30); }
}

function drawFooter(doc, order) {
  const pageHeight = doc.page.height;
  let y = pageHeight - 80;
  doc.moveTo(50, y).lineTo(545, y).strokeColor('#e0e0e0').stroke();
  y += 10;
  doc.fontSize(8).font('Helvetica').fillColor('#999').text('Thank you for your business!', 50, y, { align: 'center', width: 495 });
  y += 15;
  doc.text('This is a computer-generated invoice and does not require a signature.', 50, y, { align: 'center', width: 495 });
  y += 15;
  doc.text('Vendra - E-commerce Platform | support@vendra.com', 50, y, { align: 'center', width: 495 });
}

async function sendInvoicePdf(req, res) {
  try {
    const { orderId } = req.params;
    const adminService = require('../modules/admin/admin.service');
    const order = await adminService.getOrderDetailAdmin(orderId);
    if (!order.invoice || order.invoice.status === 'NOT_GENERATED') {
      return res.status(400).json({ success: false, message: 'Invoice not generated for this order' });
    }
    const pdfBuffer = await generateInvoicePdf(order);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.invoice.invoiceNumber || order.orderNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Invoice PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
  }
}

module.exports = { generateInvoicePdf, sendInvoicePdf };