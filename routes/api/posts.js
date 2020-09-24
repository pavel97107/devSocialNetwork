const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const router = Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

//@route POST api/posts
//@desc Create post
//@access Private
router.post(
  "/",
  [auth, [body("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      await newPost.save();

      res.status(201).json(newPost);
    } catch (error) {
      console.error(err.message);
      req.status(500).send("Server Error");
    }
  }
);

module.exports = router;
