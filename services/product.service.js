const product_data_repository = require("../data_repositories/product.data_repository");

class product_service {
  constructor() {
    console.log("FILE: product.service.js | constructor | Service initialized");
  }

  async create_product(product_data) {
    try {
      console.log(`FILE: product.service.js | create_product | Creating product: ${product_data.name}`);

      // If category is provided as name, find and set category_id
      if (product_data.category && !product_data.category_id) {
        const category_model = require("../models/category.model");
        const categoryDoc = await category_model.findOne({ name: product_data.category, is_active: 1 });
        if (categoryDoc) {
          product_data.category_id = categoryDoc._id;
        }
      }

      // Calculate discount percentage if original_price is provided
      if (product_data.original_price && product_data.price < product_data.original_price) {
        const discount = ((product_data.original_price - product_data.price) / product_data.original_price) * 100;
        product_data.discount_percentage = Math.round(discount);
      }

      const new_product = await product_data_repository.create_product(product_data);

      // Trigger notification for new product (async, non-blocking)
      setImmediate(async () => {
        try {
          const notification_service = require("./notification.service");
          await notification_service.notifyNewProduct(new_product._id.toString());
        } catch (error) {
          console.error(`FILE: product.service.js | create_product | Error sending notifications:`, error);
          // Don't fail product creation if notification fails
        }
      });

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: new_product,
      };
    } catch (error) {
      console.error(`FILE: product.service.js | create_product | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00401",
        ERROR_DESCRIPTION: error.message || "Failed to create product",
      };
    }
  }

  async get_product_by_id(product_id) {
    try {
      console.log(`FILE: product.service.js | get_product_by_id | Fetching product: ${product_id}`);

      const product = await product_data_repository.get_product_by_id(product_id);
      if (!product) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00501",
          ERROR_DESCRIPTION: "Product not found",
        };
      }

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: product,
      };
    } catch (error) {
      console.error(`FILE: product.service.js | get_product_by_id | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00502",
        ERROR_DESCRIPTION: error.message || "Failed to fetch product",
      };
    }
  }

  async get_all_products(query_params) {
    try {
      console.log(`FILE: product.service.js | get_all_products | Fetching products with params:`, query_params);

      const page = parseInt(query_params.page) || 1;
      const limit = parseInt(query_params.limit) || 50;
      const skip = (page - 1) * limit;

      // Build filters
      const filters = { is_active: 1 };
      
      // Only accept category_id (not category name)
      if (query_params.category_id) {
        // Use category_id directly if provided
        const mongoose = require("mongoose");
        if (mongoose.Types.ObjectId.isValid(query_params.category_id)) {
          filters.category_id = new mongoose.Types.ObjectId(query_params.category_id);
          console.log(`FILE: product.service.js | get_all_products | Filtering by category_id: ${query_params.category_id}`);
        } else {
          console.log(`FILE: product.service.js | get_all_products | Invalid category_id format: ${query_params.category_id}`);
          return {
            STATUS: "ERROR",
            ERROR_FILTER: "INVALID_REQUEST",
            ERROR_CODE: "VTAPP-00507",
            ERROR_DESCRIPTION: "Invalid category_id format. Please provide a valid MongoDB ObjectId.",
          };
        }
      }
      if (query_params.search) {
        filters.$or = [
          { name: { $regex: query_params.search, $options: "i" } },
          { description: { $regex: query_params.search, $options: "i" } },
        ];
      }

      // Build sort
      const sort = {};
      if (query_params.sort_by) {
        switch (query_params.sort_by) {
          case "price_low":
            sort.price = 1;
            break;
          case "price_high":
            sort.price = -1;
            break;
          case "rating":
            sort.rating = -1;
            break;
          case "newest":
            sort.created_at = -1;
            break;
          default:
            sort.created_at = -1;
        }
      } else {
        sort.created_at = -1;
      }

      const products = await product_data_repository.get_all_products(filters, sort, skip, limit);
      const total_count = await product_data_repository.count_products(filters);

      console.log(`FILE: product.service.js | get_all_products | Returning ${products.length} products (total: ${total_count}) filtered by category_id: ${filters.category_id || 'N/A'}`);

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          products: products,
          pagination: {
            page: page,
            limit: limit,
            total: total_count,
            total_pages: Math.ceil(total_count / limit),
          },
        },
      };
    } catch (error) {
      console.error(`FILE: product.service.js | get_all_products | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00503",
        ERROR_DESCRIPTION: error.message || "Failed to fetch products",
      };
    }
  }

  async update_product(product_id, update_data) {
    try {
      console.log(`FILE: product.service.js | update_product | Updating product: ${product_id}`);

      // Check if product exists
      const existing_product = await product_data_repository.get_product_by_id(product_id);
      if (!existing_product) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00601",
          ERROR_DESCRIPTION: "Product not found",
        };
      }

      // If category is provided as name, find and set category_id
      if (update_data.category && !update_data.category_id) {
        const category_model = require("../models/category.model");
        const categoryDoc = await category_model.findOne({ name: update_data.category, is_active: 1 });
        if (categoryDoc) {
          update_data.category_id = categoryDoc._id;
        }
      }

      // Calculate discount percentage if original_price is provided
      if (update_data.original_price && update_data.price && update_data.price < update_data.original_price) {
        const discount = ((update_data.original_price - update_data.price) / update_data.original_price) * 100;
        update_data.discount_percentage = Math.round(discount);
      }

      const updated_product = await product_data_repository.update_product(product_id, update_data);

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: updated_product,
      };
    } catch (error) {
      console.error(`FILE: product.service.js | update_product | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00602",
        ERROR_DESCRIPTION: error.message || "Failed to update product",
      };
    }
  }

  async delete_product(product_id) {
    try {
      console.log(`FILE: product.service.js | delete_product | Deleting product: ${product_id}`);

      // Check if product exists
      const existing_product = await product_data_repository.get_product_by_id(product_id);
      if (!existing_product) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00701",
          ERROR_DESCRIPTION: "Product not found",
        };
      }

      const deleted_product = await product_data_repository.delete_product(product_id);

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: { message: "Product deleted successfully", product_id: product_id },
      };
    } catch (error) {
      console.error(`FILE: product.service.js | delete_product | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00702",
        ERROR_DESCRIPTION: error.message || "Failed to delete product",
      };
    }
  }

  async get_products_list() {
    try {
      console.log(`FILE: product.service.js | get_products_list | Fetching products list`);
      const products = await product_data_repository.get_products_list();
      
      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: products,
      };
    } catch (error) {
      console.error(`FILE: product.service.js | get_products_list | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00508",
        ERROR_DESCRIPTION: error.message || "Failed to fetch products list",
      };
    }
  }
}

module.exports = new product_service();

