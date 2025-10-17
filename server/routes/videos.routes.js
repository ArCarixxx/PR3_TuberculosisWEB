const express = require("express");
const { saveVideo, listVideos } = require("../controllers/videos.controller");
const router = express.Router();
router.post("/", saveVideo);
router.get("/", listVideos);
module.exports = router;