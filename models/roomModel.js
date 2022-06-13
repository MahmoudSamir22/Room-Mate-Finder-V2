const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, "City Is Required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area Is Required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address Is Required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    roomsNo: {
      type: Number,
      max: 5,
      min: 1,
      required: [true, "Rooms Numbers Is Required"],
    },
    roomPrice: {
      type: Number,
      min: 1,
      required: [true, "Price Is Required"],
    },
    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple", "Quadruple"],
      required: [
        true,
        "Type Is Required (Single, Double, Triple, Quadruple) it's a case sensetive",
      ],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gender: {
      type: String,
      required: [true, "Gender Is Required"],
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
