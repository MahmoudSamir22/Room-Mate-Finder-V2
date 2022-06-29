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
 
const { auth, allowedTo } = require("../controllers/authController");

router
  .route("/")
  .post(
    auth,
    allowedTo("user"),
    uploadRoomImages,
    resizeRoomImages,
    createRoomValidator,
    addRoom
  )
  .get(getRooms);

router
  .route("/:id")
  .get(getRoomValidator, getRoom)
  .put(auth, updateRoomValidator, updateRoom)
  .delete(auth, deleteRoomValidator, deleteRoom);

module.exports = router;
