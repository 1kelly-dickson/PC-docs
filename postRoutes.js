const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "username");
  res.json(posts);
});

router.post("/", auth, async (req, res) => {
  const post = new Post({ ...req.body, author: req.user.id });
  await post.save();
  res.status(201).json(post);
});

router.delete("/:id", auth, role("admin"), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

module.exports = router;
