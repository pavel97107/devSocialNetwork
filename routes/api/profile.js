const { Router } = require("express");
const router = Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");

//@route GET api/users
//@desc Get current user profile
//@access Public
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
