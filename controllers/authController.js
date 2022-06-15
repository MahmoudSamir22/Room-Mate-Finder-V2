const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { generateToken } = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

exports.signUp = asyncHandler(async (req, res, next) => {});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or password incorrect", 401));
  }
  const token = generateToken(user._id);
  res.status(200).json({ status: "Success", data: user, token });
});

exports.auth = asyncHandler(async (req, res, next) => {
  // 1) check if token exist, if exists hold it
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "");
  }
  if (!token) {
    return next(
      new ApiError("UnAuthorized user, Please login with valid account", 401)
    );
  }
  // 2) verify token (no change happend, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3) check if user exists
  const user = await User.findById(decoded.userId);
  if (!user) {
    return next(new ApiError("There is no user with this token", 404));
  }
  // 4) check if user change his password after token created
  if (user.passwordChangedAt) {
    const passwordToTimeStamps = parseInt(user.passwordChangedAt / 1000, 10);
    if (passwordToTimeStamps > decoded.iat) {
      return next(
        new ApiError("User changet password recently please login later", 401)
      );
    }
  }
  // 5) set user to req
  req.user = user;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("This user is not allowed to use this route", 403)
      );
    }
    next();
  });
