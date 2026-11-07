'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Category = require('../src/modules/catalog/category.model');
const CatalogItem = require('../src/modules/catalog/catalogItem.model');
const VendorListing = require('../src/modules/catalog/vendorListing.model');
const Vendor = require('../src/modules/vendors/vendor.model');
const { VERTICALS, VENDOR_TYPES, VENDOR_OWNERSHIP } = require('../src/common/constants/orderStatuses');

/**
 * Requested exact categories:
 * 1. Electronics
 * 2. Cosmetics
 * 3. Clothes
 * 4. Shoes
 * 5. Accessories
 * 6. Watches
 */
const targetCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smart gadgets, audio equipment, portable chargers and personal tech.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    sortOrder: 1,
  },
  {
    name: 'Cosmetics',
    slug: 'cosmetics',
    description: 'Luxury skincare, fragrances, botanical serums and beauty essentials.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    sortOrder: 2,
  },
  {
    name: 'Clothes',
    slug: 'clothes',
    description: 'Tailored apparel, luxury minimalist wear and premium cotton garments.',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
    sortOrder: 3,
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    description: 'Designer sneakers, artisan leather footwear and performance running shoes.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    sortOrder: 4,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Handcrafted leather wallets, laptop sleeves, eyewear and statement accents.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    sortOrder: 5,
  },
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Precision chronographs, minimalist timepieces and smart wearable watches.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
    sortOrder: 6,
  },
];

// Rich, authentic catalog products curated specifically for these 6 categories
const seedProducts = [
  // ── 1. ELECTRONICS ──
  {
    category: 'electronics',
    sku: 'VD-EL-001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation and 40-hour playback.',
    pricePaise: 449900,
    mrpPaise: 799900,
    unit: 'piece',
    unitSize: 1,
    stock: 25,
    tags: ['electronics', 'headphones', 'audio', 'wireless'],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
  },
  {
    category: 'electronics',
    sku: 'VD-EL-002',
    name: 'Portable High-Res Bluetooth Speaker',
    description: 'Compact acoustic speaker with deep bass, 360-degree sound, and waterproof chassis.',
    pricePaise: 299900,
    mrpPaise: 499900,
    unit: 'piece',
    unitSize: 1,
    stock: 30,
    tags: ['electronics', 'speaker', 'bluetooth', 'audio'],
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
  },
  {
    category: 'electronics',
    sku: 'VD-EL-003',
    name: '65W GaN Fast Charger & Hub',
    description: 'Ultra-compact multi-port GaN wall charger with dual USB-C Power Delivery.',
    pricePaise: 189900,
    mrpPaise: 299900,
    unit: 'piece',
    unitSize: 1,
    stock: 45,
    tags: ['electronics', 'charger', 'gan', 'fast charge'],
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80'],
  },

  // ── 2. COSMETICS ──
  {
    category: 'cosmetics',
    sku: 'VD-CS-001',
    name: 'Hydrating Botanical Face Serum',
    description: 'Cold-pressed botanical serum enriched with hyaluronic acid and niacinamide for radiant skin.',
    pricePaise: 149900,
    mrpPaise: 229900,
    unit: 'bottle',
    unitSize: 50,
    stock: 40,
    tags: ['cosmetics', 'serum', 'skincare', 'botanical'],
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'],
  },
  {
    category: 'cosmetics',
    sku: 'VD-CS-002',
    name: 'Artisan Eau de Parfum - Velvet Amber',
    description: 'Handcrafted fragrance with warm notes of vanilla amber, cedarwood, and bergamot.',
    pricePaise: 389900,
    mrpPaise: 549900,
    unit: 'bottle',
    unitSize: 100,
    stock: 20,
    tags: ['cosmetics', 'perfume', 'fragrance', 'luxury'],
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80'],
  },
  {
    category: 'cosmetics',
    sku: 'VD-CS-003',
    name: 'Revitalizing Overnight Glow Mask',
    description: 'Nourishing antioxidant sleep treatment for deep cellular renewal and elasticity.',
    pricePaise: 119900,
    mrpPaise: 189900,
    unit: 'jar',
    unitSize: 60,
    stock: 35,
    tags: ['cosmetics', 'mask', 'night cream', 'beauty'],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'],
  },

  // ── 3. CLOTHES ──
  {
    category: 'clothes',
    sku: 'VD-CL-001',
    name: 'Heavyweight Supima Cotton Oversized Tee',
    description: 'Pre-shrunk 260 GSM combed cotton tailored t-shirt in architectural relaxed silhouette.',
    pricePaise: 129900,
    mrpPaise: 199900,
    unit: 'piece',
    unitSize: 1,
    stock: 50,
    tags: ['clothes', 'apparel', 'cotton', 'oversized'],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'],
  },
  {
    category: 'clothes',
    sku: 'VD-CL-002',
    name: 'Minimalist Relaxed Linen Shirt',
    description: 'Bespoke breathable pure European linen button-down designed for effortless layering.',
    pricePaise: 249900,
    mrpPaise: 389900,
    unit: 'piece',
    unitSize: 1,
    stock: 28,
    tags: ['clothes', 'shirt', 'linen', 'menswear'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
  },
  {
    category: 'clothes',
    sku: 'VD-CL-003',
    name: 'Architectural Wool Blend Overcoat',
    description: 'Structured single-breasted outerwear made from warm, sustainable recycled wool blend.',
    pricePaise: 699900,
    mrpPaise: 999900,
    unit: 'piece',
    unitSize: 1,
    stock: 15,
    tags: ['clothes', 'jacket', 'coat', 'winter'],
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce667823?w=800&q=80'],
  },

  // ── 4. SHOES ──
  {
    category: 'shoes',
    sku: 'VD-SH-001',
    name: 'Carbon-Plate Aerodynamic Runners',
    description: 'Featherlight marathon running sneaker with responsive supercritical foam and carbon plate.',
    pricePaise: 599900,
    mrpPaise: 899900,
    unit: 'pair',
    unitSize: 1,
    stock: 22,
    tags: ['shoes', 'sneakers', 'running', 'footwear'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
  },
  {
    category: 'shoes',
    sku: 'VD-SH-002',
    name: 'Artisan Full-Grain Leather Derby Shoes',
    description: 'Hand-burnished Italian calfskin leather shoes with Goodyear welted leather sole.',
    pricePaise: 749900,
    mrpPaise: 1199900,
    unit: 'pair',
    unitSize: 1,
    stock: 18,
    tags: ['shoes', 'leather', 'derby', 'formal'],
    images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80'],
  },
  {
    category: 'shoes',
    sku: 'VD-SH-003',
    name: 'Minimalist Monochromatic Street Sneaker',
    description: 'Low-top retro tennis silhouette handcrafted from supple nappa leather with memory insole.',
    pricePaise: 399900,
    mrpPaise: 599900,
    unit: 'pair',
    unitSize: 1,
    stock: 35,
    tags: ['shoes', 'sneakers', 'streetwear', 'casual'],
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'],
  },

  // ── 5. ACCESSORIES ──
  {
    category: 'accessories',
    sku: 'VD-AC-001',
    name: 'Full-Grain Leather Bifold Wallet',
    description: 'Vegetable-tanned slim wallet with RFID blocking layer and 8 card slots.',
    pricePaise: 129900,
    mrpPaise: 199900,
    unit: 'piece',
    unitSize: 1,
    stock: 45,
    tags: ['accessories', 'wallet', 'leather', 'everyday'],
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
  },
  {
    category: 'accessories',
    sku: 'VD-AC-002',
    name: 'Water-Resistant Commuter Laptop Backpack',
    description: 'Architectural weather-sealed pack with padded 16-inch laptop chamber and luggage strap.',
    pricePaise: 329900,
    mrpPaise: 499900,
    unit: 'piece',
    unitSize: 1,
    stock: 30,
    tags: ['accessories', 'backpack', 'bag', 'travel'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
  },
  {
    category: 'accessories',
    sku: 'VD-AC-003',
    name: 'Polarized Titanium Sunglasses',
    description: 'Featherlight aerospace titanium frames with UV400 anti-reflective polarized lenses.',
    pricePaise: 249900,
    mrpPaise: 399900,
    unit: 'piece',
    unitSize: 1,
    stock: 25,
    tags: ['accessories', 'eyewear', 'sunglasses', 'titanium'],
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'],
  },

  // ── 6. WATCHES ──
  {
    category: 'watches',
    sku: 'VD-WT-001',
    name: 'Minimal Bauhaus Chronograph Watch',
    description: 'Sapphire crystal glass timepiece with Japanese quartz movement and quick-release leather strap.',
    pricePaise: 489900,
    mrpPaise: 799900,
    unit: 'piece',
    unitSize: 1,
    stock: 20,
    tags: ['watches', 'chronograph', 'analog', 'minimal'],
    images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80'],
  },
  {
    category: 'watches',
    sku: 'VD-WT-002',
    name: 'AMOLED Titanium Smartwatch',
    description: 'Always-on AMOLED display with heart rate monitoring, GPS tracking, and 14-day battery life.',
    pricePaise: 649900,
    mrpPaise: 999900,
    unit: 'piece',
    unitSize: 1,
    stock: 24,
    tags: ['watches', 'smartwatch', 'amoled', 'fitness'],
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'],
  },
  {
    category: 'watches',
    sku: 'VD-WT-003',
    name: 'Automatic Diver 200M Steel Watch',
    description: 'Self-winding mechanical dive watch with ceramic rotating bezel and solid steel jubilee bracelet.',
    pricePaise: 999900,
    mrpPaise: 1499900,
    unit: 'piece',
    unitSize: 1,
    stock: 12,
    tags: ['watches', 'automatic', 'mechanical', 'luxury'],
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'],
  },
];

async function getCommerceVendor() {
  let vendor = await Vendor.findOne({ vertical: VERTICALS.COMMERCE, ownership: VENDOR_OWNERSHIP.PLATFORM });
  if (vendor) return vendor;
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
}

async function run() {
  console.log('Connecting to database...');
  await mongoose.connect(env.db.uri);
  console.log('Connected to MongoDB.');

  const vendor = await getCommerceVendor();
  console.log(`Using vendor: ${vendor.name} (${vendor._id})`);

  // Target slugs
  const targetSlugs = targetCategories.map((c) => c.slug);

  // 1. Mark any old commerce categories inactive (or delete them if not in target)
  await Category.deleteMany({ vertical: 'commerce', slug: { $nin: targetSlugs } });
  console.log('Cleaned up non-target commerce categories from DB.');

  // 2. Insert or update the 6 exact categories
  const categoryMap = new Map();
  for (const cat of targetCategories) {
    const updated = await Category.findOneAndUpdate(
      { slug: cat.slug, vertical: 'commerce' },
      {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        iconUrl: cat.image,
        sortOrder: cat.sortOrder,
        vertical: 'commerce',
        isActive: true,
      },
      { upsert: true, new: true },
    );
    categoryMap.set(cat.slug, updated._id);
    console.log(`✓ Category synced: ${updated.name} (${updated.slug})`);
  }

  // 3. Clear existing commerce items & listings to replace with authentic curated products
  await CatalogItem.deleteMany({ vertical: 'commerce' });
  await VendorListing.deleteMany({ vertical: 'commerce' });
  console.log('Cleaned up previous commerce listings.');

  // 4. Seed products for the 6 categories
  for (const p of seedProducts) {
    const catId = categoryMap.get(p.category);
    if (!catId) continue;

    const item = await CatalogItem.create({
      name: p.name,
      slug: p.sku.toLowerCase(),
      kind: 'sku',
      vertical: 'commerce',
      scope: 'vendor',
      vendorId: vendor._id,
      categoryId: catId,
      description: p.description,
      tags: p.tags,
      searchTerms: [p.name, ...p.tags],
      attributes: {
        unit: p.unit,
        unitSize: p.unitSize,
        barcode: p.sku,
        isVeg: true,
        spiceLevel: 'none',
      },
      tax: { gstPercent: 18 },
      status: 'active',
      media: p.images.map((url, i) => ({
        url,
        type: 'image',
        isPrimary: i === 0,
      })),
    });

    await VendorListing.create({
      vendorId: vendor._id,
      itemId: item._id,
      vertical: 'commerce',
      pricePaise: p.pricePaise,
      mrpPaise: p.mrpPaise,
      isAvailable: true,
      stock: { track: true, available: p.stock, reserved: 0 },
      maxQtyPerOrder: 10,
      sortOrder: 0,
    });

    console.log(`  + Listing added: ${p.name} [₹${p.pricePaise / 100}] -> ${p.category}`);
  }

  console.log('\nAll 6 categories and authentic catalog listings successfully synced to MongoDB!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});

