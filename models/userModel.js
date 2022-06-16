const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name Is Required"],
    },
    age: {
      type: Number,
      required: [true, "Age Is Required"],
    },
    gender: {
      type: String,
      required: [true, "Gender Is Required (Male, Female) it's Case sensitive"],
      enum: ["Male", "Female"],
    },
    email: {
      type: String,
      required: [true, "Email is Required"],
      trim: true,
      lowercase: true,
      unique: [true, "This Email Already in use"],
    },
    password: {
      type: String,
      required: [true, "Password is Required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpirs: Date,
    passwordResetVerified: Boolean
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
