const { Router } = require("express");
const auth = require("../../middleware/auth");
const User = require('../../models/User')
const router = Router();

//@route GET api/users
//@desc Test route
//@access Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch(e) {
    res.status(500).json(e)
  }
});

module.exports = router;
