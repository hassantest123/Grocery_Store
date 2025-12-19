const express = require("express");
const router = express.Router();
const upload_controller = require("../controllers/upload.controller");
const { upload_single_image } = require("../middlewares/upload.middleware");
const auth_middleware = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload management APIs
 */

/**
 * @swagger
 * /api/v1/upload/image:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to upload
 *       - in: formData
 *         name: folder
 *         type: string
 *         required: false
 *         description: Folder name in Cloudinary (default: grocery_store)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/image",
  auth_middleware.authenticate,
  upload_single_image,
  upload_controller.upload_image
);

/**
 * @swagger
 * /api/v1/upload/image/{public_id}:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Public ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/image/:public_id",
  auth_middleware.authenticate,
  upload_controller.delete_image
);

module.exports = router;

