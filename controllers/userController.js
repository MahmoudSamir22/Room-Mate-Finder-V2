const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

exports.addUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  await user.save();
  res.status(201).json({ data: user });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res
    .status(200)
    .json({ status: "Success", result: users.length, data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ApiError(`There is no user with this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: "Success", data: user });
});

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

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(
      new ApiError(`There is no user with this id: ${req.params.id}`, 404)
    );
  }
  res.status(204).json();
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isEqual = await bcrypt.compare(oldPassword, user.password);
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
