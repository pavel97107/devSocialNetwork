const { Router } = require("express");
const router = Router();

//@route GET api/users
//@desc Test route
//@access Public
router.get("/", (req, res) => {
  res.send("Auth route");
});

module.exports = router;
