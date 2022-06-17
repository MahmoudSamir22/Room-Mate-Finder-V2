const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");

const factoryHandler = require("./handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

exports.resizeProfileImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imgName = `User-profileImg-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${imgName}`);
    req.body.profileImg = imgName;
  }
  next();
});

exports.uploadUserImage = uploadSingleImage("profileImg");

exports.addUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  await user.save();
  res.status(201).json({ data: user });
});

exports.getUsers = factoryHandler.getAll(User);

exports.getUser = factoryHandler.getOne(User);

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
    },
    { new: true }
  );
  if (!user) {
    return next(
      new ApiError(`There is no user with this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: "Success", data: user });
});

exports.deleteUser = factoryHandler.deleteOne(User);

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const isEqual = await bcrypt.compare(oldPassword, req.user.password);
  if (!isEqual) {
    return next(new ApiError("Password incorrect", 400));
  }
  await User.findByIdAndUpdate(req.user._id, {
    password: await bcrypt.hash(newPassword, 12),
  });
  res
    .status(200)
    .json({ status: "success", message: "Password updated successfully" });
});
