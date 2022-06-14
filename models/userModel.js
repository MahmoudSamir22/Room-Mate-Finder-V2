const mongoose = require("mongoose");

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
      min: 11,
      max: 11,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
