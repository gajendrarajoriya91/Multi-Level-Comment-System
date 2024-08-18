const Comment = require("../models/commentModel");
const Post = require("../models/postModel");

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user._id;

  try {
    const post = new Post({
      title,
      content,
      user: userId,
    });

    await post.save();

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post. Please try again later.",
    });
  }
};

exports.updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { title, content },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update post. Please try again later.",
    });
  }
};

exports.deletePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete post. Please try again later.",
    });
  }
};

exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      content: text,
      post: postId,
      user: userId,
    });

    res
      .status(201)
      .json({ message: "Comment created successfully", comment: comment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.replyToComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = await Comment.create({
      content: text,
      post: postId,
      user: userId,
      parentComment: commentId,
    });
    parentComment.replies.push(reply._id);
    await parentComment.save();

    res.status(201).json({
      message: "Reply created successfully",
      reply: reply,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComments = async (req, res) => {
  const { postId } = req.params;
  const { sortBy = "createdAt", sortOrder = "desc" } = req.query;

  try {
    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate({
        path: "replies",
        options: { sort: { createdAt: -1 }, limit: 2 },
      })
      .sort([[sortBy, sortOrder]]);

    const result = comments.map((comment) => ({
      id: comment._id,
      text: comment.content,
      createdAt: comment.createdAt,
      postId: comment.post,
      parentCommentId: comment.parentComment || null,
      replies: comment.replies.map((reply) => ({
        id: reply._id,
        text: reply.content,
        createdAt: reply.createdAt,
      })),
      totalReplies: comment.replies.length,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.expandComments = async (req, res) => {
  const { postId, commentId } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  try {
    const parentComment = await Comment.findById(commentId).populate({
      path: "replies",
      options: {
        skip: (page - 1) * pageSize,
        limit: Number(pageSize),
        sort: { createdAt: -1 },
      },
    });

    if (!parentComment || String(parentComment.post) !== postId) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const result = parentComment.replies.map((reply) => ({
      id: reply._id,
      text: reply.content,
      createdAt: reply.createdAt,
      postId: reply.post,
      parentCommentId: reply.parentComment,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
