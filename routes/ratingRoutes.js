const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/:id", authMiddleware, ratingController.avaliarJogo);
router.get("/:id/media", authMiddleware, ratingController.mediaDoJogo);

module.exports = router;