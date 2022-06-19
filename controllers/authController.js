const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { sendEmail } = require("../utils/sendEmail");
const { generateToken } = require("../utils/generateToken");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

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

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Email or password incorrect", 401));
  }
  const token = generateToken(user._id);
  res.status(200).json({ status: "Success", data: user, token });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if(!user) {
    return next(new ApiError('Something went wrong', 404))
  }
  res.status(200).json({ status: "Success", data: user})
})

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
