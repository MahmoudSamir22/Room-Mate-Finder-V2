const fs = require("fs");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");

const factoryHandler = require("./handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const { login } = require("./authController");

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

// @desc Add new User data
// @route POST /api/v1/users/
// @access Public
exports.addUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  await user.save();
  res.status(201).json({ data: user });
});

// @desc Get all users data
// @route GET /api/v1/users/
// @access Private/Admin
exports.getUsers = factoryHandler.getAll(User);

// @desc Get spesific user data
// @route GET /api/v1/users/
// @access Private/Admin/User
exports.getUser = factoryHandler.getOne(User);

// @desc Update specific user data
// @route PUT /api/v1/users/
// @access Private/Admin/User
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

// @desc Delete spesific user data
// @route DELETE /api/v1/users/
// @access Private/Admin/User
exports.deleteUser = factoryHandler.deleteOne(User, "User");

// @desc Get spesific user data
// @route PUT /api/v1/users/
// @access Private/User
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

// @desc Get checkout sesssion
// @route POST /api/v1/users/create-checkout-session
// @access Private/User
exports.createCheckOutSession = asyncHandler(async (req, res) => {
  const priceId = req.body.priceId;
  const session = await stripe.checkout.sessions.create({
    // billing_address_collection: "auto",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/rooms`,
    cancel_url: `${req.protocol}://${req.get("host")}/`,
    customer_email: req.user.email,
    client_reference_id: req.body.userId,
  });

  res.status(200).json({ status: "success", data: session });
});

// @desc Change user isSub status to true
// @route Local function
// @access Private
const changeUserToSub = async (session) => {
  const userId = session.client_reference_id;
  await User.findByIdAndUpdate(userId, { isSub: true }, { new: true });
};
// @desc Change user isSub status to true if paid
// @route POST /sub-webhook
// @access Public
exports.webHookCheckOut = asyncHandler(async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    const signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.log(`??????  Webhook signature verification failed.`);
      return res.status(400).send();
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }
  if (eventType === "checkout.session.completed") {
    console.log(`Paied successfully and now is sub`);
    changeUserToSub(data.object);
  }
  res.status(200).json({ message: "Done" });
});
