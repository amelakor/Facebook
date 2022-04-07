const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = require("express").Router();

// update user

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (e) {
        return res.status(400).json(e);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });

      res.status(200).json("Account has been updated");
    } catch (e) {
      return res.status(400).json(e);
    }
  } else {
    return res.status(403).json("You can update only your account");
  }
});

// delete user

router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json("Account has been deleted");
    } catch (e) {
      return res.status(400).json(e);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});
// get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const { password, isAdmin, updatedAt, ...other } = user._doc;

    res.status(200).json(other);
  } catch (e) {
    return res.status(400).json(e);
  }
});
// follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const loggedUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await loggedUser.updateOne({ $push: { followings: req.params.id } });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You are already follow this user");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("You cannot follow yourself");
  }
});
// unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const loggedUser = await User.findById(req.body.userId);

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await loggedUser.updateOne({ $pull: { followings: req.params.id } });

        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You are don't follow this user");
      }
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(403).json("You cannot unfollow yourself");
  }
});

module.exports = router;
