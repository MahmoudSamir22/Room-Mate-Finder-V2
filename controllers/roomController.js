const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { uploadMixOfImages } = require("../middleware/uploadImageMiddleware");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
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

exports.addRoom = asyncHandler(async (req, res) => {
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

exports.getRooms = asyncHandler(async (req, res) => {
  const countDocuments = await Room.countDocuments();
  const apiFeatures = new ApiFeatures(Room.find(), req.query)
    .sort()
    .limitFields()
    .paginate(countDocuments)
    .filtering()
    .search()
  const { mongooseQuery, paginationResult } = apiFeatures;
  const rooms = await mongooseQuery;
  res.status(200).json({
    paginationResult,
    result: rooms.length,
    data: rooms,
  });
});

exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return next(
      new ApiError(`There is no room with this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: "Success", data: room });
});

exports.updateRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!room) {
    return next(
      new ApiError(`There is no room with this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: "Success", data: room });
});

exports.deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) {
    return next(
      new ApiError(`There is no room with this id: ${req.params.id}`, 404)
    );
  }
  res.status(204).json();
});
