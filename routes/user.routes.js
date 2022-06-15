const router = require("express").Router();
const {
  addUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
} = require("../controllers/userController");

const {
  createUserValidator,
  getUserValidator,
  deleteUserValidator,
  updateUserValidator,
} = require("../utils/validators/userValidator");

const { auth } = require("../controllers/authController");

router.route("/").post(createUserValidator, addUser).get(auth, getUsers);

router.use(auth);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put("/changePassword/:id", changePassword);

module.exports = router;
