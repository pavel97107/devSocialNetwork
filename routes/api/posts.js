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

//@route GET api/posts
//@desc GET all posts
//@access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    if (!posts) return res.status(404).send("Posts not found");

    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

//@route GET api/posts
//@desc GET post by id
//@access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.log(error);
    res.status(500).send("Server error");
  }
});

//@route DELETE api/posts
//@desc DELETE post by id
//@access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User no authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

//@route PUT api/posts/likes/:id
//@desc   Like a post
//@access Private

router.put("/likes/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    let likePost = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    );

    if (likePost.length > 0) {
      post.likes = post.likes.filter((like) => like.user.toString() !== req.user.id);
    } else {
      post.likes.unshift({ user: req.user.id });
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: error });
  }
});

module.exports = router;
