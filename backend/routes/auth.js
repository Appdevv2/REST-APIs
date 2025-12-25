const express = require("express");

const { body } = require("express-validator");

const User = require("../models/user");

const router = express.Router();

const authController = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a vialed email")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("E-Mail address already exist");
        }
      })
      .normalizeEmail(),
    body("password").trim().notEmpty().isLength({ min: 6 }),
    body("name").trim().notEmpty(),
  ],
  authController.signUp
);

router.post("/login", authController.login);

module.exports = router;
