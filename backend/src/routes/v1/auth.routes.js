const express = require("express");
const { body } = require("express-validator");
const authController = require("../../controllers/authController");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 80 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number"),
    body("role").optional().isIn(["user", "admin"]),
    body("adminInviteCode").optional().isString(),
  ],
  validate,
  asyncHandler(authController.register)
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 1 }),
  ],
  validate,
  asyncHandler(authController.login)
);

router.get("/me", auth, asyncHandler(authController.me));

module.exports = router;
