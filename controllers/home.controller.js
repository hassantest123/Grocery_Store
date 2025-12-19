const category_service = require("../services/category.service");
const product_service = require("../services/product.service");
const order_data_repository = require("../data_repositories/order.data_repository");
const product_data_repository = require("../data_repositories/product.data_repository");
const mongoose = require("mongoose");

class home_controller {
  async get_home_data(req, res) {
    try {
      console.log(`FILE: home.controller.js | get_home_data | Request received`);

      // Fetch active categories
      const categories_result = await category_service.get_all_categories();
      const popular_categories = categories_result.STATUS === "SUCCESSFUL" 
        ? (categories_result.DB_DATA.categories || categories_result.DB_DATA || []) 
        : [];

      // Fetch most expensive products (sorted by price descending)
      const products_result = await product_service.get_all_products({
        page: 1,
        limit: 20, // Get top 20 most expensive products
        sort_by: "price_high",
      });

      const popular_products = products_result.STATUS === "SUCCESSFUL"
        ? (products_result.DB_DATA.products || []).slice(0, 12) // Limit to 12 most expensive
        : [];

      // Fetch Daily Best Sells (today's best selling products)
      const daily_best_sells = await get_daily_best_sells();

      return res.status(200).json({
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          Popular_Categories: popular_categories,
          Popular_Products: popular_products,
          Daily_Best_Sells: daily_best_sells,
        },
      });
    } catch (error) {
      console.error(`FILE: home.controller.js | get_home_data | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00601",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

}

// Helper function to get daily best selling products
async function get_daily_best_sells() {
  try {
    console.log(`FILE: home.controller.js | get_daily_best_sells | Fetching daily best selling products`);
    
    const TARGET_COUNT = 4; // Always return 4 products
    const product_model = require("../models/product.model");
    
    // Get today's best selling product IDs
    const best_selling_product_ids = await order_data_repository.get_todays_best_selling_products(TARGET_COUNT);
    
    let daily_best_sells = [];
    
    // Fetch product details for best selling products
    if (best_selling_product_ids.length > 0) {
      const product_ids = best_selling_product_ids
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      
      if (product_ids.length > 0) {
        // Fetch products by IDs and maintain order
        const best_products = await product_model.find({
          _id: { $in: product_ids },
          is_active: 1
        }).populate('category_id', 'name image');
        
        // Create a map for quick lookup
        const product_map = {};
        best_products.forEach(product => {
          product_map[product._id.toString()] = product;
        });
        
        // Add products in the same order as sales ranking
        best_selling_product_ids.forEach(product_id => {
          const product = product_map[product_id];
          if (product) {
            daily_best_sells.push(product);
          }
        });
      }
    }
    
    // If we have less than 4 products, fill with other active products
    if (daily_best_sells.length < TARGET_COUNT) {
      const remaining_count = TARGET_COUNT - daily_best_sells.length;
      
      // Get IDs we already have to exclude them
      const existing_ids = daily_best_sells.map(p => p._id.toString());
      const exclude_ids = existing_ids.length > 0 
        ? existing_ids.map(id => new mongoose.Types.ObjectId(id))
        : [];
      
      // Build query to exclude already included products
      const additional_query = { is_active: 1 };
      if (exclude_ids.length > 0) {
        additional_query._id = { $nin: exclude_ids };
      }
      
      // Fetch additional products (excluding already included ones)
      const additional_products = await product_model
        .find(additional_query)
        .populate('category_id', 'name image')
        .sort({ created_at: -1 }) // Sort by newest
        .limit(remaining_count);
      
      daily_best_sells = [...daily_best_sells, ...additional_products];
    }
    
    // Ensure we return exactly 4 products (or less if not enough products exist)
    const final_products = daily_best_sells.slice(0, TARGET_COUNT);
    
    console.log(`FILE: home.controller.js | get_daily_best_sells | Returning ${final_products.length} daily best selling products`);
    
    return final_products;
  } catch (error) {
    console.error(`FILE: home.controller.js | get_daily_best_sells | Error:`, error);
    // Return empty array on error, don't break the home API
    return [];
  }
}

module.exports = new home_controller();

