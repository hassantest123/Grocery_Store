const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

// Get MongoDB connection - use shared connection to ensure all models use the same instance
const { db_connection } = require("../_core_app_connectivities/db_connection_shared");
const grocery_store_db = db_connection;

const product_schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: null,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  original_price: {
    type: Number,
    min: 0,
    default: null, // For discount calculation
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: false, // Keep for backward compatibility, will be deprecated
    trim: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  label: {
    type: String,
    enum: ["Sale", "Hot", "New", null],
    default: null,
  },
  discount_percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null, // e.g., 14 for 14%
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews_count: {
    type: Number,
    min: 0,
    default: 0,
  },
  stock_quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  is_active: {
    type: Number,
    enum: [0, 1],
    default: 1, // 0: Inactive, 1: Active
  },
  created_at: {
    type: Number,
    default: () => moment().unix(),
  },
  updated_at: {
    type: Number,
    default: () => moment().unix(),
  },
});

// Indexes for faster lookups
product_schema.index({ category: 1 }); // Keep for backward compatibility
product_schema.index({ category_id: 1 }); // New index for category reference
product_schema.index({ is_active: 1 });
product_schema.index({ created_at: -1 });
product_schema.index({ price: 1 });
product_schema.index({ rating: -1 });

// Virtual for discount calculation
product_schema.virtual("discount_amount").get(function () {
  if (this.original_price && this.price < this.original_price) {
    return this.original_price - this.price;
  }
  return 0;
});

module.exports = grocery_store_db.model("product", product_schema);

