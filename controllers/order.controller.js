const order_service = require("../services/order.service");
const auth_middleware = require("../middlewares/auth.middleware");

class order_controller {
  async create_order(req, res) {
    try {
      console.log(`FILE: order.controller.js | create_order | Request received`);

      const user = req.user; // From auth middleware
      const { items, shipping_address, delivery_time, delivery_instructions, payment_method, payment_account_number, tax, shipping } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-01306",
          ERROR_DESCRIPTION: "Items are required",
        });
      }

      if (!shipping_address || !shipping_address.name || !shipping_address.email || !shipping_address.address) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-01307",
          ERROR_DESCRIPTION: "Shipping address is required with name, email, and address",
        });
      }

      if (!payment_method) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-01308",
          ERROR_DESCRIPTION: "Payment method is required",
        });
      }

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal + (tax || 0) + (shipping || 0);

      const order_data = {
        user_id: user.user_id,
        items: items,
        subtotal: subtotal,
        tax: tax || 0,
        shipping: shipping || 0,
        total: total,
        shipping_address: shipping_address,
        delivery_time: delivery_time || null,
        delivery_instructions: delivery_instructions || null,
        payment_method: payment_method,
        payment_account_number: payment_account_number || null,
      };

      const result = await order_service.create_order(order_data);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error(`FILE: order.controller.js | create_order | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01309",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_order_by_id(req, res) {
    try {
      console.log(`FILE: order.controller.js | get_order_by_id | Request received for ID: ${req.params.order_id}`);

      const result = await order_service.get_order_by_id(req.params.order_id);

      if (result.STATUS === "ERROR") {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: order.controller.js | get_order_by_id | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01310",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_user_orders(req, res) {
    try {
      console.log(`FILE: order.controller.js | get_user_orders | Request received`);

      const user = req.user; // From auth middleware
      const result = await order_service.get_user_orders(user.user_id);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: order.controller.js | get_user_orders | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01311",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_all_orders(req, res) {
    try {
      console.log(`FILE: order.controller.js | get_all_orders | Request received`);

      const filters = {
        payment_status: req.query.payment_status || null,
        order_status: req.query.order_status || null,
        user_id: req.query.user_id || null,
      };

      const result = await order_service.get_all_orders(filters);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: order.controller.js | get_all_orders | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01313",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new order_controller();

