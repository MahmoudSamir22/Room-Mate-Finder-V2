const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { uploadMixOfImages } = require("../middleware/uploadImageMiddleware");
const factoryHandler = require("./handler");
const { deleteImgsFromServer } = require("../utils/deleteImages");
const ApiError = require("../utils/apiError");
const Room = require("../models/roomModel");

exports.resizeRoomImages = asyncHandler(async (req, res, next) => {
  if (req.files) {
    req.body.images = [];
    await Promise.all(
      req.files.map(async (image, index) => {
        const imgName = `Room-Image-${uuidv4()}-${Date.now()}-${++index}.jpeg`;
        await sharp(image.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/rooms/${imgName}`);
        req.body.images.push(imgName);
      })
    );
  }
  next();
});

exports.uploadRoomImages = uploadMixOfImages("images");

// @desc Add room to the DB
// @route POST /api/v1/rooms/
// @access Private/User
exports.addRoom = asyncHandler(async (req, res, next) => {
  if (!req.user.isSub) {
    const room = await Room.findOne({ owner: req.user._id });
    if (room) {
      deleteImgsFromServer(req.body, "Room");
      return next(
        new ApiError(
          "You can't add more than one room you have to be a subscriber first",
          400
        )
      );
    }
  }
  const room = await Room.create({
    city: req.body.city,
    area: req.body.area,
    address: req.body.address,
    description: req.body.description,
    roomsNo: req.body.roomsNo,
    roomPrice: req.body.roomPrice,
    roomType: req.body.roomType,
    gender: req.user.gender,
    owner: req.user._id,
    images: req.body.images,
  });
  await room.save();
  res.status(201).json({ status: "Success", data: room });
});

// @desc Get all rooms data
// @route GET /api/v1/rooms/
// @access Private/User

exports.getRooms = factoryHandler.getAll(Room);

// @desc Get spesific room
// @route GET /api/v1/rooms/
// @access Private/User
exports.getRoom = factoryHandler.getOne(Room);

// @desc Update spesific room
// @route PUT /api/v1/rooms/
// @access Private/User
exports.updateRoom = factoryHandler.updateOne(Room);

// @desc Delete spesific room
// @route DELETE /api/v1/rooms/
// @access Private/User
exports.deleteRoom = factoryHandler.deleteOne(Room, "Room");
