const fs = require("fs");
const Room = require("../models/roomModel");

const deleteImages = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

exports.deleteImgsFromServer = async (document, modelName = "") => {
  // 1) if model is room => delete room images from server
  if (modelName == "Room") {
    if (document.images) {
      document.images.map((img) => {
        deleteImages(`./uploads/rooms/${img}`);
      });
    }
  }
  // 2) if model is user => delete user images from server and delete room from db and its images
  else if (modelName == "User") {
    if (document.profileImg) {
      deleteImages(`./uploads/users/${document.profileImg}`);
    }
    const rooms = await Room.find({ owner: document._id });
    if (rooms) {
      rooms.map((room) => {
        if (room.images) {
          room.images.map((img) => {
            deleteImages(`./uploads/rooms/${img}`);
          });
        }
      });
    }
  }
};
