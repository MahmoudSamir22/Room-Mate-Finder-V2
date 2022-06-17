const router = require("express").Router();
const {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  uploadUserImage,
  resizeProfileImage
} = require("../controllers/userController");

const {
  createUserValidator,
  getUserValidator,
  deleteUserValidator,
  updateUserValidator,
} = require("../utils/validators/userValidator");

const { auth } = require("../controllers/authController");

router.route("/").post(uploadUserImage, resizeProfileImage, createUserValidator, addUser).get(auth, getUsers);

router.use(auth);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put("/changePassword/:id", auth, changePassword);

module.exports = router;
