const user_service = require("../services/user.service");

class user_controller {
  async register(req, res) {
    try {
      console.log(`FILE: user.controller.js | register | Request received`);

      const { name, email, password, phone, address } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00103",
          ERROR_DESCRIPTION: "Name, email, and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00104",
          ERROR_DESCRIPTION: "Password must be at least 6 characters long",
        });
      }

      const result = await user_service.register_user({
        name,
        email,
        password,
        phone,
        address,
      });

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error(`FILE: user.controller.js | register | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00105",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async login(req, res) {
    try {
      console.log(`FILE: user.controller.js | login | Request received`);

      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00205",
          ERROR_DESCRIPTION: "Email and password are required",
        });
      }

      const result = await user_service.login_user(email, password);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: user.controller.js | login | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00206",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_profile(req, res) {
    try {
      console.log(`FILE: user.controller.js | get_profile | Request received`);

      const user = req.user; // From auth middleware
      const result = await user_service.get_user_profile(user.user_id);

      if (result.STATUS === "ERROR") {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: user.controller.js | get_profile | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00403",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async update_profile(req, res) {
    try {
      console.log(`FILE: user.controller.js | update_profile | Request received`);

      const user = req.user; // From auth middleware
      const { name, email, phone, address } = req.body;

      // Validation
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00505",
          ERROR_DESCRIPTION: "Invalid email format",
        });
      }

      const update_data = {};
      if (name !== undefined) update_data.name = name;
      if (email !== undefined) update_data.email = email;
      if (phone !== undefined) update_data.phone = phone;
      if (address !== undefined) update_data.address = address;

      if (Object.keys(update_data).length === 0) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-00506",
          ERROR_DESCRIPTION: "No fields to update",
        });
      }

      const result = await user_service.update_user_profile(user.user_id, update_data);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: user.controller.js | update_profile | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00507",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  async get_all_users_list(req, res) {
    try {
      console.log(`FILE: user.controller.js | get_all_users_list | Request received`);

      const result = await user_service.get_all_users_list();

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: user.controller.js | get_all_users_list | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00602",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new user_controller();

