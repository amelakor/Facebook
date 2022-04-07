const router = require("express").Router();
const { findById } = require("../models/Post");
const Post = require("../models/Post");
const User = require("../models/User");

// create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  } catch (e) {
    res.status(500).json(e);
  }
});

//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(201).json(post);
    } else {
      res.status(401).json("You can update only your posts");
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId === req.body.userId) {
      await post.delete();
      res.status(201).json(null);
    } else {
      res.status(401).json("You can delete only your posts");
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

// like a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
    }

    res.status(201).json(post);
  } catch (e) {
    res.status(500).json(e);
  }
});

//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json(e);
  }
});

//get timeline posts

router.get("/timeline/all", async (req, res) => {
  try {
    const loggedUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({ userId: loggedUser._id });
    const friendPosts = await Promise.all(
      loggedUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json([...userPosts, ...friendPosts]);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
