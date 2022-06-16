const router = require("express").Router();

const {
  login,
  signUp,
  forgetPassword,
  verifyResetCode,
  resetPassword
} = require("../controllers/authController");

router.post("/signup", signUp);

router.post("/login", login);

router.post("/forgetPassword", forgetPassword);

router.post("/verifyResetCode", verifyResetCode);

router.put('/resetPassword', resetPassword)

module.exports = router;
