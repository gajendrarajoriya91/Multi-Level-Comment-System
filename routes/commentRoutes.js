const express = require("express");
const {
  createComment,
  replyToComment,
  getComments,
  expandComments,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");
const apiLimiter = require("../config/rateLimitConfig");

const router = express.Router();

router.post("/", protect, createPost);

router.put("/:postId", protect, updatePost);

router.delete("/:postId", protect, deletePost);

router.post("/:postId/comments", protect, apiLimiter, createComment);
router.post(
  "/:postId/comments/:commentId/reply",
  protect,
  apiLimiter,
  replyToComment
);
router.get("/:postId/comments", protect, getComments);
router.get("/:postId/comments/:commentId/expand", protect, expandComments);

module.exports = router;
