const router = require("express").Router();

const {
  addRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  resizeRoomImages,
} = require("../controllers/roomController");
const {
  createRoomValidator,
  getRoomValidator,
  deleteRoomValidator,
  updateRoomValidator,
} = require("../utils/validators/roomValidator");

const { auth } = require("../controllers/authController");

router
  .route("/")
  .post(auth, uploadRoomImages, resizeRoomImages, createRoomValidator, addRoom)
  .get(getRooms);


router
  .route("/:id")
  .get(getRoomValidator, getRoom)
  .put(auth, updateRoomValidator, updateRoom)
  .delete(auth, deleteRoomValidator, deleteRoom);

module.exports = router;
