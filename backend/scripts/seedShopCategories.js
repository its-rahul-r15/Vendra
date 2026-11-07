'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Category = require('../src/modules/catalog/category.model');
const { VERTICALS } = require('../src/common/constants/orderStatuses');

/**
 * Comprehensive Multi-Category Department & Shop Category Taxonomy
 * Covers Retail, Boutiques, Gourmet, Dining, Groceries, Artisanal & Living
 */
const SHOP_CATEGORIES = [
  // ── 1. Commerce & Retail Boutiques ──
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    vertical: VERTICALS.COMMERCE,
    description: 'Designer apparel, boutique wear, footwear, and luxury accessories',
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    vertical: VERTICALS.COMMERCE,
    description: 'Audio gear, smart tech, mobile devices, computing, and peripherals',
    sortOrder: 2,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  },
  {
    name: 'Home, Living & Decor',
    slug: 'home-living-decor',
    vertical: VERTICALS.COMMERCE,
    description: 'Artisanal homeware, handcrafted decor, soft lighting, and furnishings',
    sortOrder: 3,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
  },
  {
    name: 'Jewellery & Watches',
    slug: 'jewellery-watches',
    vertical: VERTICALS.COMMERCE,
    description: 'Fine jewellery, silver pieces, minimalist watches, and keepsakes',
    sortOrder: 4,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  },
  {
    name: 'Beauty, Wellness & Care',
    slug: 'beauty-wellness',
    vertical: VERTICALS.COMMERCE,
    description: 'Organic skincare, fragrances, botanical bath items, and cosmetics',
    sortOrder: 5,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
  },
  {
    name: 'Books, Crafts & Stationery',
    slug: 'books-crafts-stationery',
    vertical: VERTICALS.COMMERCE,
    description: 'Paper stationery, journal sets, craft kits, and indie publications',
    sortOrder: 6,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
  },

  // ── 2. Gourmet Food, Dining & Eateries ──
  {
    name: 'Gourmet Bakeries & Desserts',
    slug: 'bakeries-desserts',
    vertical: VERTICALS.FOOD,
    description: 'Artisan sourdough, pastries, festive cookies, and specialty sweets',
    sortOrder: 7,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  },
  {
    name: 'Bistros & Cafes',
    slug: 'bistros-cafes',
    vertical: VERTICALS.FOOD,
    description: 'Specialty coffee roasters, gourmet snacks, wraps, and deli sandwiches',
    sortOrder: 8,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  },
  {
    name: 'Authentic Dining & Kitchens',
    slug: 'dining-kitchens',
    vertical: VERTICALS.FOOD,
    description: 'Local chef kitchens, traditional North & South Indian, Italian, and Asian cuisine',
    sortOrder: 9,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },

  // ── 3. Groceries, Organic Produce & Pantry Essentials ──
  {
    name: 'Organic Farm Produce',
    slug: 'organic-produce',
    vertical: VERTICALS.GROCERY,
    description: 'Farm-fresh seasonal vegetables, organic fruits, and microgreens',
    sortOrder: 10,
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&q=80',
  },
  {
    name: 'Gourmet Pantry & Spices',
    slug: 'pantry-spices',
    vertical: VERTICALS.GROCERY,
    description: 'Artisanal condiments, cold-pressed oils, spice blends, and organic grains',
    sortOrder: 11,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&q=80',
  },
  {
    name: 'Artisanal Teas & Specialty Coffee',
    slug: 'tea-coffee',
    vertical: VERTICALS.GROCERY,
    description: 'Single-origin beans, herbal infusions, matcha, and estate loose teas',
    sortOrder: 12,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80',
  },

  // ── 4. Gifts & Curated Collections (Etsy-style Festive & Gifting) ──
  {
    name: 'Gifts & Festive Hampers',
    slug: 'gifts-festive-hampers',
    vertical: 'both',
    description: 'Handpicked gift boxes, holiday treats, custom souvenirs, and personalized kits',
    sortOrder: 13,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80',
  },
];

async function seedShopCategories() {
  console.log('Connecting to MongoDB for category setup...');
  await mongoose.connect(env.db.uri);

  let updatedCount = 0;
  for (const item of SHOP_CATEGORIES) {
    await Category.updateOne(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          vertical: item.vertical,
          description: item.description,
          sortOrder: item.sortOrder,
          order: item.sortOrder,
          image: item.image,
          iconUrl: item.image,
          isActive: true,
        },
      },
      { upsert: true }
    );
    updatedCount++;
  }

  console.log(`Successfully configured ${updatedCount} multi-vendor shop categories.`);
  await mongoose.disconnect();
}

if (require.main === module) {
  seedShopCategories().catch(async (err) => {
    console.error('Error seeding categories:', err);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
}

module.exports = { SHOP_CATEGORIES, seedShopCategories };

