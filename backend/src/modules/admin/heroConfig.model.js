'use strict';

const mongoose = require('mongoose');

const heroConfigSchema = new mongoose.Schema(
  {
    // Unique identifier for the theme
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    
    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Theme description
    description: {
      type: String,
      trim: true,
    },
    
    // Radial gradient for background
    radialGlow: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Theme display name (e.g., 'Velvet Carmine')
    themeName: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Transparent PNG image path (relative to public folder)
    heroPng: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Product options (e.g., ['30mm', '40mm', '50mm'])
    options: [{
      type: String,
      trim: true,
    }],
    
    // Match rules - used to find matching products from catalog
    matchRules: {
      // Match by product name keywords (any of these)
      nameKeywords: [{
        type: String,
        trim: true,
        lowercase: true,
      }],
      // Match by tags (any of these)
      tags: [{
        type: String,
        trim: true,
        lowercase: true,
      }],
      // Match by category slug
      categorySlug: {
        type: String,
        trim: true,
        lowercase: true,
      },
      // Custom JS function as string (advanced)
      customMatchFunction: {
        type: String,
        trim: true,
      },
    },
    
    // Display order
    sortOrder: {
      type: Number,
      default: 0,
    },
    
    // Is this theme active/enabled
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Is this the default fallback theme
    isDefault: {
      type: Boolean,
      default: false,
    },
    
    // SEO/meta
    metaTitle: String,
    metaDescription: String,
    
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
heroConfigSchema.index({ isActive: 1, sortOrder: 1 });
heroConfigSchema.index({ key: 1 }, { unique: true });

// Virtual for match function (eval-safe)
heroConfigSchema.virtual('matchFunction').get(function () {
  if (this.matchRules.customMatchFunction) {
    try {
      return new Function('item', 'return ' + this.matchRules.customMatchFunction);
    } catch (e) {
      return null;
    }
  }
  // Default matcher based on keywords/tags/category
  return function (item) {
    const itemData = item.itemId || item.product || item;
    if (!itemData) return false;
    
    const name = (itemData.name || '').toLowerCase();
    const tags = (itemData.tags || []).map(t => t.toLowerCase());
    const categorySlug = itemData.categoryId?.slug?.toLowerCase();
    
    const rules = this.matchRules;
    
    // Check name keywords
    if (rules.nameKeywords?.length) {
      if (rules.nameKeywords.some(kw => name.includes(kw))) return true;
    }
    
    // Check tags
    if (rules.tags?.length) {
      if (rules.tags.some(tag => tags.includes(tag))) return true;
    }
    
    // Check category
    if (rules.categorySlug && categorySlug === rules.categorySlug) return true;
    
    return false;
  };
});

// Static method to get active themes ordered
heroConfigSchema.statics.getActiveThemes = function () {
  return this.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
};

// Static method to get default theme
heroConfigSchema.statics.getDefaultTheme = function () {
  return this.findOne({ isDefault: true, isActive: true });
};

// Instance method to test match
heroConfigSchema.methods.testMatch = function (product) {
  const fn = this.matchFunction;
  return fn ? fn(product) : false;
};

const HeroConfig = mongoose.model('HeroConfig', heroConfigSchema);

module.exports = HeroConfig;