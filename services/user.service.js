const user_data_repository = require("../data_repositories/user.data_repository");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "A9F7K2M8ZQ4R6X5B";
const JWT_EXPIRES_IN = "7d";

class user_service {
  constructor() {
    console.log("FILE: user.service.js | constructor | Service initialized");
  }

  async register_user(user_data) {
    try {
      console.log(`FILE: user.service.js | register_user | Registering user: ${user_data.email}`);

      // Check if user already exists
      const existing_user = await user_data_repository.get_user_by_email(user_data.email);
      if (existing_user) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "USER_END_VIOLATION",
          ERROR_CODE: "VTAPP-00101",
          ERROR_DESCRIPTION: "User with this email already exists",
        };
      }

      // Create user
      const new_user = await user_data_repository.create_user({
        name: user_data.name,
        email: user_data.email,
        password: user_data.password,
        phone: user_data.phone || null,
        address: user_data.address || null,
        role: user_data.role || "user",
      });

      // Generate token
      const token = this.generate_token(new_user._id, new_user.email, new_user.role);

      // Remove password from response
      const user_response = {
        _id: new_user._id,
        name: new_user.name,
        email: new_user.email,
        phone: new_user.phone,
        address: new_user.address,
        role: new_user.role,
        created_at: new_user.created_at,
      };

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          user: user_response,
          token: token,
        },
      };
    } catch (error) {
      console.error(`FILE: user.service.js | register_user | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00102",
        ERROR_DESCRIPTION: error.message || "Failed to register user",
      };
    }
  }

  async login_user(email, password) {
    try {
      console.log(`FILE: user.service.js | login_user | Logging in user: ${email}`);

      // Get user by email
      const user = await user_data_repository.get_user_by_email(email);
      if (!user) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "USER_END_VIOLATION",
          ERROR_CODE: "VTAPP-00201",
          ERROR_DESCRIPTION: "Invalid email or password",
        };
      }

      // Check if user is active
      if (user.is_active === 0) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "USER_END_VIOLATION",
          ERROR_CODE: "VTAPP-00202",
          ERROR_DESCRIPTION: "Your account has been deactivated",
        };
      }

      // Verify password
      const is_password_valid = await user.compare_password(password);
      if (!is_password_valid) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "USER_END_VIOLATION",
          ERROR_CODE: "VTAPP-00203",
          ERROR_DESCRIPTION: "Invalid email or password",
        };
      }

      // Generate token
      const token = this.generate_token(user._id, user.email, user.role);

      // Remove password from response
      const user_response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        created_at: user.created_at,
      };

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          user: user_response,
          token: token,
        },
      };
    } catch (error) {
      console.error(`FILE: user.service.js | login_user | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00204",
        ERROR_DESCRIPTION: error.message || "Failed to login user",
      };
    }
  }

  generate_token(user_id, email, role) {
    try {
      const payload = {
        user_id: user_id.toString(),
        email: email,
        role: role,
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return token;
    } catch (error) {
      console.error(`FILE: user.service.js | generate_token | Error:`, error);
      throw error;
    }
  }

  verify_token(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        STATUS: "SUCCESSFUL",
        DB_DATA: decoded,
      };
    } catch (error) {
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "USER_END_VIOLATION",
        ERROR_CODE: "VTAPP-00301",
        ERROR_DESCRIPTION: "Invalid or expired token",
      };
    }
  }

  async get_user_profile(user_id) {
    try {
      console.log(`FILE: user.service.js | get_user_profile | Fetching profile for user: ${user_id}`);

      const user = await user_data_repository.get_user_by_id(user_id);
      if (!user) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "NOT_FOUND",
          ERROR_CODE: "VTAPP-00401",
          ERROR_DESCRIPTION: "User not found",
        };
      }

      // Remove password from response
      const user_response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          user: user_response,
        },
      };
    } catch (error) {
      console.error(`FILE: user.service.js | get_user_profile | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00402",
        ERROR_DESCRIPTION: error.message || "Failed to fetch user profile",
      };
    }
  }

  async update_user_profile(user_id, update_data) {
    try {
      console.log(`FILE: user.service.js | update_user_profile | Updating profile for user: ${user_id}`);

      // Check if user exists
      const existing_user = await user_data_repository.get_user_by_id(user_id);
      if (!existing_user) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "NOT_FOUND",
          ERROR_CODE: "VTAPP-00501",
          ERROR_DESCRIPTION: "User not found",
        };
      }

      // If email is being updated, check if new email already exists
      if (update_data.email && update_data.email !== existing_user.email) {
        const email_exists = await user_data_repository.get_user_by_email(update_data.email);
        if (email_exists) {
          return {
            STATUS: "ERROR",
            ERROR_FILTER: "USER_END_VIOLATION",
            ERROR_CODE: "VTAPP-00502",
            ERROR_DESCRIPTION: "Email already in use",
          };
        }
      }

      // Prepare update data (only allow name, email, phone, address)
      const allowed_fields = ["name", "email", "phone", "address"];
      const filtered_update = {};
      for (const field of allowed_fields) {
        if (update_data[field] !== undefined) {
          filtered_update[field] = update_data[field];
        }
      }

      // Update user
      const updated_user = await user_data_repository.update_user(user_id, filtered_update);
      if (!updated_user) {
        return {
          STATUS: "ERROR",
          ERROR_FILTER: "TECHNICAL_ISSUE",
          ERROR_CODE: "VTAPP-00503",
          ERROR_DESCRIPTION: "Failed to update user profile",
        };
      }

      // Remove password from response
      const user_response = {
        _id: updated_user._id,
        name: updated_user.name,
        email: updated_user.email,
        phone: updated_user.phone,
        address: updated_user.address,
        role: updated_user.role,
        created_at: updated_user.created_at,
        updated_at: updated_user.updated_at,
      };

      return {
        STATUS: "SUCCESSFUL",
        ERROR_CODE: "",
        ERROR_FILTER: "",
        ERROR_DESCRIPTION: "",
        DB_DATA: {
          user: user_response,
        },
      };
    } catch (error) {
      console.error(`FILE: user.service.js | update_user_profile | Error:`, error);
      return {
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-00504",
        ERROR_DESCRIPTION: error.message || "Failed to update user profile",
      };
    }
  }
}

module.exports = new user_service();

