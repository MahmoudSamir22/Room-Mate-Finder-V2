const router = require("express").Router();
const { addRoom } = require("../controllers/roomController");

router.route("/").get((req, res) => {
  res.json({ welcome: "Hello Mate" });
}).post(addRoom);

module.exports = router;
