const jwt = require("jsonwebtoken");

exports.generateToken = (payload) => {
  return jwt.sign({ userId: payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EPIRED_TIME,
  });
};
