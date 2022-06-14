const router = require("express").Router();

const {
  addRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const {
  createRoomValidator,
  getRoomValidator,
  deleteRoomValidator,
  updateRoomValidator,
} = require("../utils/validators/roomValidator");

router.route("/").get(getRooms).post(createRoomValidator, addRoom);

router
  .route("/:id")
  .get(getRoomValidator, getRoom)
  .put(updateRoomValidator, updateRoom)
  .delete(deleteRoomValidator, deleteRoom);

module.exports = router;
