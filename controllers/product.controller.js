const product_service = require("../services/product.service");

class product_controller {
  async create_product(req, res) {
    try {
      console.log(`FILE: product.controller.js | create_product | Request received`);

      const { name, description, price, original_price, image, category, label, stock_quantity } = req.body;

      // Validation
      if (!name || !price || !image || !category) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00402",
          ERROR_DESCRIPTION: "Name, price, image, and category are required",
        });
      }

      if (price < 0) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00403",
          ERROR_DESCRIPTION: "Price must be a positive number",
        });
      }

      const result = await product_service.create_product({
        name,
        description: description || null,
        price,
        original_price: original_price || null,
        image,
        category,
        label: label || null,
        stock_quantity: stock_quantity || 0,
      });

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | create_product | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00404",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_product_by_id(req, res) {
    try {
      console.log(`FILE: product.controller.js | get_product_by_id | Request received`);

      const { product_id } = req.params;

      if (!product_id) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00504",
          ERROR_DESCRIPTION: "Product ID is required",
        });
      }

      const result = await product_service.get_product_by_id(product_id);

      if (result.STATUS === "ERROR") {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | get_product_by_id | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00505",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_all_products(req, res) {
    try {
      console.log(`FILE: product.controller.js | get_all_products | Request received`);

      const result = await product_service.get_all_products(req.query);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | get_all_products | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00506",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async update_product(req, res) {
    try {
      console.log(`FILE: product.controller.js | update_product | Request received`);

      const { product_id } = req.params;
      const update_data = req.body;

      if (!product_id) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00603",
          ERROR_DESCRIPTION: "Product ID is required",
        });
      }

      if (update_data.price !== undefined && update_data.price < 0) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00604",
          ERROR_DESCRIPTION: "Price must be a positive number",
        });
      }

      const result = await product_service.update_product(product_id, update_data);

      if (result.STATUS === "ERROR") {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | update_product | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00605",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async delete_product(req, res) {
    try {
      console.log(`FILE: product.controller.js | delete_product | Request received`);

      const { product_id } = req.params;

      if (!product_id) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00703",
          ERROR_DESCRIPTION: "Product ID is required",
        });
      }

      const result = await product_service.delete_product(product_id);

      if (result.STATUS === "ERROR") {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | delete_product | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00704",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_products_list(req, res) {
    try {
      console.log(`FILE: product.controller.js | get_products_list | Request received`);
      
      const result = await product_service.get_products_list();
      
      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: product.controller.js | get_products_list | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00509",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new product_controller();

