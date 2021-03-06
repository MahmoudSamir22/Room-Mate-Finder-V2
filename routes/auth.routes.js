const router = require("express").Router();

const {
  login,
  signUp,
  forgetPassword,
  verifyResetCode,
  resetPassword,
  getLoggedUserData,
  auth
} = require("../controllers/authController");

router.post("/signup", signUp);

router.post("/login", login);

router.post("/forgetPassword", forgetPassword);

router.post("/verifyResetCode", verifyResetCode);

router.put('/resetPassword', resetPassword)

router.get('/', auth, getLoggedUserData)

module.exports = router;
