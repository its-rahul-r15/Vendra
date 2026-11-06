'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Category = require('../src/modules/catalog/category.model');
const CatalogItem = require('../src/modules/catalog/catalogItem.model');
const VendorListing = require('../src/modules/catalog/vendorListing.model');
const Vendor = require('../src/modules/vendors/vendor.model');
const { VERTICALS, VENDOR_TYPES, VENDOR_OWNERSHIP } = require('../src/common/constants/orderStatuses');

const categories = [
  ['Electronics', 'electronics', 'Devices and everyday technology', 1],
  ['Mobile Phones', 'mobile-phones', 'Smartphones and mobile devices', 2],
  ['Audio & Headphones', 'audio-headphones', 'Headphones, speakers and audio gear', 3],
  ['Watches', 'watches', 'Classic and smart watches', 4],
  ['Accessories', 'accessories', 'Useful accessories for your devices and lifestyle', 5],
  ['Computers', 'computers', 'Laptops, tablets and computer accessories', 6],
  ['Cameras', 'cameras', 'Cameras and photography equipment', 7],
  ['Smart Home', 'smart-home', 'Connected devices for your home', 8],
];

// Seed catalog data into MongoDB only. The storefront has no bundled product records.
const products = [
  { category: 'electronics', sku: 'VD-EL-001', name: 'Portable Bluetooth Speaker', description: 'Compact wireless speaker with clear sound and rechargeable battery.', price: 249900, stock: 24, tags: ['speaker', 'bluetooth', 'wireless'] },
  { category: 'electronics', sku: 'VD-EL-002', name: 'USB-C Fast Charger 30W', description: '30W USB-C wall charger for compatible phones, tablets and accessories.', price: 129900, stock: 40, tags: ['charger', 'usb-c', 'fast charging'] },
  { category: 'mobile-phones', sku: 'VD-MB-001', name: 'Smartphone 128GB', description: 'Unlocked smartphone with 128GB storage and dual SIM support.', price: 1899900, stock: 12, tags: ['smartphone', 'mobile', '128gb'] },
  { category: 'mobile-phones', sku: 'VD-MB-002', name: 'Protective Phone Case', description: 'Shock-absorbing protective case with a slim, comfortable grip.', price: 79900, stock: 35, tags: ['phone case', 'mobile cover', 'protection'] },
  { category: 'audio-headphones', sku: 'VD-AU-001', name: 'Wireless Over-Ear Headphones', description: 'Comfort-fit wireless headphones with built-in microphone.', price: 349900, stock: 20, tags: ['headphones', 'wireless', 'audio'] },
  { category: 'audio-headphones', sku: 'VD-AU-002', name: 'True Wireless Earbuds', description: 'Pocket-sized Bluetooth earbuds with charging case.', price: 219900, stock: 28, tags: ['earbuds', 'bluetooth', 'wireless audio'] },
  { category: 'watches', sku: 'VD-WA-001', name: 'Everyday Analog Watch', description: 'Minimal analog wristwatch with an adjustable strap.', price: 279900, stock: 16, tags: ['watch', 'analog', 'wristwatch'] },
  { category: 'watches', sku: 'VD-WA-002', name: 'Fitness Smart Watch', description: 'Smart watch with activity tracking and phone notifications.', price: 499900, stock: 14, tags: ['smartwatch', 'fitness', 'wearable'] },
  { category: 'accessories', sku: 'VD-AC-001', name: 'Braided USB-C Cable 1m', description: 'Durable braided USB-C charging and data cable.', price: 49900, stock: 50, tags: ['usb-c', 'cable', 'charging'] },
  { category: 'accessories', sku: 'VD-AC-002', name: 'Adjustable Laptop Stand', description: 'Foldable, adjustable stand for laptops and tablets.', price: 89900, stock: 22, tags: ['laptop stand', 'desk accessory', 'adjustable'] },
  { category: 'computers', sku: 'VD-CO-001', name: 'Wireless Keyboard and Mouse Set', description: 'Compact wireless keyboard and mouse set for home or office.', price: 159900, stock: 18, tags: ['keyboard', 'mouse', 'computer'] },
  { category: 'computers', sku: 'VD-CO-002', name: 'USB-C 7-in-1 Hub', description: 'Multiport USB-C hub for connecting displays and peripherals.', price: 229900, stock: 15, tags: ['usb-c hub', 'computer accessory', 'adapter'] },
  { category: 'cameras', sku: 'VD-CA-001', name: '1080p USB Webcam', description: 'Full HD webcam for video calls, classes and streaming.', price: 199900, stock: 17, tags: ['webcam', 'camera', 'video calls'] },
  { category: 'cameras', sku: 'VD-CA-002', name: 'Flexible Camera Tripod', description: 'Lightweight adjustable tripod for compatible cameras and phones.', price: 99900, stock: 19, tags: ['tripod', 'camera accessory', 'photography'] },
  { category: 'smart-home', sku: 'VD-SH-001', name: 'Wi-Fi Smart Plug', description: 'Connected plug for controlling compatible household devices.', price: 119900, stock: 26, tags: ['smart home', 'wifi plug', 'connected device'] },
  { category: 'smart-home', sku: 'VD-SH-002', name: 'LED Smart Bulb 9W', description: 'Dimmable smart LED bulb with app-based control.', price: 89900, stock: 30, tags: ['smart bulb', 'lighting', 'smart home'] },
];

async function getCommerceVendor() {
  let vendor = await Vendor.findOne({ vertical: VERTICALS.COMMERCE, ownership: VENDOR_OWNERSHIP.PLATFORM });
  if (vendor) return vendor;
  try {
    return await Vendor.create({
      name: 'Vendra Store',
      slug: 'vendra-store',
      type: VENDOR_TYPES.RETAIL_STORE,
      vertical: VERTICALS.COMMERCE,
      ownership: VENDOR_OWNERSHIP.PLATFORM,
      location: { type: 'Point', coordinates: [77.209, 28.6139] },
      address: { line1: 'Vendra Fulfilment Centre', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      images: {},
      isActive: true,
      isOpen: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      vendor = await Vendor.findOne({ vertical: VERTICALS.COMMERCE, ownership: VENDOR_OWNERSHIP.PLATFORM });
      if (vendor) return vendor;
    }
    throw error;
  }
}

async function main() {
  await mongoose.connect(env.db.uri);
  const categoryIds = new Map();
  for (const [name, slug, description, sortOrder] of categories) {
    await Category.updateOne(
      { slug },
      { $setOnInsert: { name, slug, vertical: 'commerce', description, sortOrder, isActive: true } },
      { upsert: true },
    );
    const category = await Category.findOne({ slug }).select('_id').lean();
    if (category) categoryIds.set(slug, category._id);
  }
  const vendor = await getCommerceVendor();
  let seededProducts = 0;
  for (const product of products) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Missing category: ${product.category}`);
    const slug = product.sku.toLowerCase();
    let item = await CatalogItem.findOne({ vendorId: vendor._id, slug });
    if (!item) {
      item = await CatalogItem.create({
        name: product.name,
        slug,
        kind: 'sku',
        vertical: VERTICALS.COMMERCE,
        scope: 'vendor',
        vendorId: vendor._id,
        categoryId,
        description: product.description,
        tags: product.tags,
        searchTerms: [product.name, ...product.tags],
        attributes: { unit: 'piece', barcode: product.sku },
        tax: { gstPercent: 18 },
        status: 'active',
      });
      seededProducts += 1;
    }
    await VendorListing.updateOne(
      { vendorId: vendor._id, itemId: item._id },
      { $setOnInsert: {
        vendorId: vendor._id,
        itemId: item._id,
        vertical: VERTICALS.COMMERCE,
        pricePaise: product.price,
        mrpPaise: product.price,
        stock: { track: true, available: product.stock, reserved: 0 },
        isAvailable: true,
        maxQtyPerOrder: 10,
      } },
      { upsert: true },
    );
  }
  console.log(`Commerce categories ready (${categories.length}); products seeded (${seededProducts}).`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Could not seed commerce categories:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
