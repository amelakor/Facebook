const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const bcryptjs = require("bcryptjs");

// register

router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(err);
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    !user && res.status(400).send("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    !validPassword && res.status(400).send("wrong password");

    res.status(200).json(user);
  } catch (e) {
    res.status(400).json(err);
  }
});

module.exports = router;
