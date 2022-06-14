const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Minimum length is 3 letters"),
  body("age")
    .notEmpty()
    .withMessage("Age is required")
    .isInt({ max: 18 })
    .withMessage("You must be above 18 years old"),
  body("gender").notEmpty().withMessage("Gender is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email format is invalid")
    .custom((val) => {
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      });
    }),
  body("password")
    .notEmpty()
    .withMessage("Pasword is required")
    .isLength({ min: 6, max: 20 })
    .withMessage("Password should be between 6 and 20 characters")
    .custom((val, { req }) => {
      if (val !== req.body.confirmPassword) {
        throw new Error("Password confirmation is incorrect");
      }
      return true;
    }),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password Confirmation is requiredd"),
  body("phone")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isMobilePhone("ar-EG"),
  validatorMiddleware,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Minimum length is 3 letters"),
  body("age")
    .optional()
    .isInt({ max: 18 })
    .withMessage("You must be above 18 years old"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email format is invalid")
    .custom((val) => {
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in use"));
        }
      });
    }),
  body("phone").optional().isMobilePhone("ar-EG"),
  validatorMiddleware,
];
