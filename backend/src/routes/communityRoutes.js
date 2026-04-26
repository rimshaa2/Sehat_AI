const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/posts", verifyToken, communityController.listPosts);
router.post("/posts", verifyToken, communityController.createPost);
router.post("/posts/:id/like", verifyToken, communityController.toggleLike);
router.post("/posts/:id/comments", verifyToken, communityController.addComment);

module.exports = router;
