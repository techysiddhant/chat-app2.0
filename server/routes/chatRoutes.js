const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { accessChat, fetchChats } = require("../controllers/chatController");
const router = express.Router();
router.route("/").post(protect,accessChat);
router.route("/").get(protect, fetchChats);
module.exports = router;