const { check, body } = require("express-validator");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

const Room = require("../../models/roomModel");

exports.createRoomValidator = [
  check("city").notEmpty().withMessage("City is required"),
  check("area").notEmpty().withMessage("Area is required"),
  check("address").notEmpty().withMessage("Address is required"),
  check("description")
    .optional()
    .isLength({ min: 20 })
    .withMessage("You should add atleast 20 character to description"),
  check("roomsNo")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rooms number must be between 1 and 5"),
  check("roomPrice").notEmpty().withMessage("Room price is required"),
  check("roomType").notEmpty().withMessage("Room type is required"),
  validatorMiddleware,
];

exports.updateRoomValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid room id format")
    .custom(async (val, { req }) => {
      const room = await Room.findById(val);
      if (req.user.role === "user") {
        if (room.owner.toString() !== req.user._id.toString()) {
          throw new Error("This room is not yours you can't update it");
        }
      }
      console.log(req.user);
      if (!req.user.isSub) {
        const room = await Room.findOne({ owner: req.user._id });
        if (room) {
          console.log("From Validator");
          throw new Error(
            "You can't add more than one room you have to be a subscriber first"
          );
        }
      }
    }),
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
  check("id")
    .isMongoId()
    .withMessage("Invalid Brand id format")
    .custom(async (val, { req }) => {
      const room = await Room.findById(val);
      if (req.user.role === "user") {
        if (room.owner._id.toString() !== req.user._id.toString()) {
          throw new Error("This room is not yours you can't delete it");
        }
      }
    }),
  validatorMiddleware,
];
