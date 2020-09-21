const { Router } = require("express");
const router = Router();
const { body, validationResult } = require("express-validator");

//@route GET api/users
//@desc Register user
//@access Public
router.post(
  "/",
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "Please include a valid email").not().isEmpty(),
    body(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    res.send("User route");
  }
);

module.exports = router;
