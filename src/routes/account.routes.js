const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Routes
 */
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user account 
 * - Protected Route
 */
router.get("/",authMiddleware.authMiddleware, accountController.getUserAccountController)

/**
 * - GET /api/accounts/balance/:accountId
 * yeh sb ke balance fetch karegi
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware, accountController.getAccountBalanceController)



module.exports = router;