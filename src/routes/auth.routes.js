const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/auth/register
router.post("/register",authController.userRegisterController)

// POST /api/auth/login
router.post("/login",authController.userLoginController)  /* authController.userLoginController-isko bole ge controller humne yha pe controller create kiya hai */

/**
 * - POST  /api/auth/logout
 */
router.post("/logout",authController.userLogoutController)

module.exports = router;