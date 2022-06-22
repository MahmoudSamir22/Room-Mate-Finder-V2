const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sendEmail } = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// @desc SignUp new user
// @route POST /api/v1/auth/signup
// @access Public

exports.signUp = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    gender: req.body.gender,
    age: req.body.age,
    phone: req.body.phone,
    profileImg: req.body.profileImg,
  });
  await user.save();
  const token = generateToken(user._id)
  res.status(201).json({ status: "Success", data: user, token });
});

// @desc Login with user account
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or password incorrect", 401));
  }
  const token = generateToken(user._id);
  res.status(200).json({ status: "Success", data: user, token });
});

// @desc Get Logged User data
// @route GET /api/v1/auth/
// @access Private/User
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if(!user) {
    return next(new ApiError('Something went wrong', 404))
  }
  res.status(200).json({ status: "Success", data: user})
})

// @desc Check the bearer token and if user signed in
// @route Middleware
// @access Public
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

// @desc Check the logged in user role for authorization
// @route Middleware
// @access Public
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("This user is not allowed to use this route", 403)
      );
    }
    next();
  });

// @desc Send a forget password request and send code to email
// @route POST /api/v1/auth/forgetPassword
// @access Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user with this email", 404));
  }
  const resetCode = Math.floor(1000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpirs = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  const message = `Hi ${user.name}, \nWe have recived a request to change the password on your Room Mate Finder account. \n ${resetCode}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Code (Valid for 10 mins)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpirs = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    console.log(error.message);
    return next(new ApiError("There was an Error sending this email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent successfully" });
});
// @desc Verify reset code 
// @route POST /api/v1/auth/verifyResetCode
// @access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpirs: {$gte: Date.now()}
  })
  if(!user){
    return next(new ApiError('Invalid or expired reset code', 404))
  }
  user.passwordResetVerified = true
  await user.save()
  res.status(200).json({ status: "success" });
});
// @desc Reset the password
// @route PUT /api/v1/auth/resetCode
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({email: req.body.email})
  if(!user){
    return next(new ApiError("No user found with this email", 404));
  }
  if(!user.passwordResetVerified){
    return next(new ApiError("Reset Code not verified", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpirs = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  
  const token = generateToken(user._id)
  res.status(200).json({token})
})
