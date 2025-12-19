const cloudinary_service = require("../services/cloudinary.service");

class upload_controller {
  /**
   * Upload a single image
   * @route POST /api/v1/upload/image
   * @access Private (Admin)
   */
  async upload_image(req, res) {
    try {
      console.log(`FILE: upload.controller.js | upload_image | Request received`);

      if (!req.file) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-01604",
          ERROR_DESCRIPTION: "No image file provided",
        });
      }

      const { folder } = req.body; // Optional folder name (default: 'grocery_store')
      const upload_folder = folder || "grocery_store";

      // Upload to Cloudinary
      const result = await cloudinary_service.upload_image(
        req.file.buffer,
        upload_folder
      );

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: upload.controller.js | upload_image | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01605",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }

  /**
   * Delete an image from Cloudinary
   * @route DELETE /api/v1/upload/image/:public_id
   * @access Private (Admin)
   */
  async delete_image(req, res) {
    try {
      console.log(`FILE: upload.controller.js | delete_image | Request received`);

      const { public_id } = req.params;

      if (!public_id) {
        return res.status(400).json({
          STATUS: "ERROR",
          ERROR_FILTER: "INVALID_REQUEST",
          ERROR_CODE: "VTAPP-01606",
          ERROR_DESCRIPTION: "Public ID is required",
        });
      }

      const result = await cloudinary_service.delete_image(public_id);

      if (result.STATUS === "ERROR") {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error(`FILE: upload.controller.js | delete_image | Error:`, error);
      return res.status(500).json({
        STATUS: "ERROR",
        ERROR_FILTER: "TECHNICAL_ISSUE",
        ERROR_CODE: "VTAPP-01607",
        ERROR_DESCRIPTION: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new upload_controller();

