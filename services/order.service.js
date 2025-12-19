const order_data_repository = require("../data_repositories/order.data_repository");
const payment_service = require("./payment.service");

class order_service {
  constructor() {
    console.log("FILE: order.service.js | constructor | Service initialized");
  }

  async create_order(order_data) {
    try {
      console.log(`FILE: order.service.js | create_order | Creating order for user: ${order_data.user_id}`);

      // Generate order number
      const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create order
      const order = await order_data_repository.create_order({
        ...order_data,
        order_number,
      });


      // console.log('what is order data', order_data);

      // If payment method is stripe, create payment intent
      let payment_intent_data = null;
      if (order_data.payment_method === "stripe") {
        const payment_result = await payment_service.create_payment_intent({
          order_id: order._id,
          user_id: order_data.user_id,
          items: order_data.items,
          total: order_data.total,
          shipping_address: order_data.shipping_address,
          payment_method: "stripe",
        });

        if (payment_result.STATUS === "SUCCESSFUL") {
          payment_intent_data = payment_result.DB_DATA;
          
          // Get updated order with payment intent ID
          const updated_order = await order_data_repository.get_order_by_id(order._id);
          return {
            STATUS: "SUCCESSFUL",
            ERROR_CODE: "",
            ERROR_FILTER: "",
            ERROR_DESCRIPTION: "",
            DB_DATA: {
              order: updated_order || order,
              payment_intent: payment_intent_data,
            },
          };
        } else {
          // If payment intent creation fails, still return order but with error
          return {
            STATUS: "ERROR",
            ERROR_FILTER: "PAYMENT_ERROR",
            ERROR_CODE: "VTAPP-01301",
            ERROR_DESCRIPTION: payment_result.ERROR_DESCRIPTION || "Failed to create payment intent",
            DB_DATA: {
              order: order,
            },
          };
        }
      }

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          order: order,
          payment_intent: null,
        },
      };
    } catch (error) {
      console.error(`FILE: order.service.js | create_order | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01302",
        ERROR_DESCRIPTION: error.message || "Failed to create order",
      };
    }
  }

  async get_order_by_id(order_id) {
    try {
      console.log(`FILE: order.service.js | get_order_by_id | Fetching order: ${order_id}`);

      const order = await order_data_repository.get_order_by_id(order_id);
      if (!order) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "NOT_FOUND",
          ERROR_CODE: "VTAPP-01303",
          ERROR_DESCRIPTION: "Order not found",
        };
      }

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: order,
      };
    } catch (error) {
      console.error(`FILE: order.service.js | get_order_by_id | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01304",
        ERROR_DESCRIPTION: error.message || "Failed to fetch order",
      };
    }
  }

  async get_user_orders(user_id) {
    try {
      console.log(`FILE: order.service.js | get_user_orders | Fetching orders for user: ${user_id}`);

      const orders = await order_data_repository.get_orders_by_user(user_id);

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          orders: orders,
          total: orders.length,
        },
      };
    } catch (error) {
      console.error(`FILE: order.service.js | get_user_orders | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01305",
        ERROR_DESCRIPTION: error.message || "Failed to fetch orders",
      };
    }
  }

  async get_all_orders(filters = {}) {
    try {
      console.log(`FILE: order.service.js | get_all_orders | Fetching all orders`);

      const orders = await order_data_repository.get_all_orders(filters);

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          orders: orders,
          total: orders.length,
        },
      };
    } catch (error) {
      console.error(`FILE: order.service.js | get_all_orders | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01312",
        ERROR_DESCRIPTION: error.message || "Failed to fetch orders",
      };
    }
  }
}

module.exports = new order_service();

