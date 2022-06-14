const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createRoomValidator = [
  body("city").notEmpty().withMessage("City is required"),
  body("area").notEmpty().withMessage("Area is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("You should add atleast 20 character to description"),
  body("roomsNo")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rooms number must be between 1 and 5"),
  body("roomPrice").notEmpty().withMessage("Rooms price is required"),
  body("roomType").notEmpty().withMessage("Rooms type is required"),
  validatorMiddleware,
];

exports.updateRoomValidator = [
  check("id").isMongoId().withMessage("Invalid room id format"),
  body("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("You should add atleast 20 character to description"),
  body("roomsNo")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rooms number must be between 1 and 5"),
  validatorMiddleware,
];

exports.getRoomValidator = [
  check("id").isMongoId().withMessage("Invalid room id format"),
  validatorMiddleware,
];

exports.deleteRoomValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
];
