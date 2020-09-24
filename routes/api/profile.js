const { Router } = require("express");
const router = Router();
const { request } = require("@octokit/request");
const auth = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
//@route GET api/profile
//@desc Get user Profile
//@access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile
//@desc Create and update user Profile
//@access Private

router.post(
  "/",
  [
    auth,
    body("status", "Status is required").not().isEmpty(),
    body("skills", "Skills is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      status,
      skills,
      company,
      website,
      location,
      bio,
      githubusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile

    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //Create Profile

      profile = new Profile(profileFields);
      await profile.save();

      res.json(profile);
    } catch (e) {
      console.error(e);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/profile/user/user_id
//@desc Get one prfoile by id
//@access Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (e) {
    if (e.kind === "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/profile/
//@desc Remove Profile and User
//@access Private

router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: "User deleted" });
  } catch (e) {
    if (e.kind === "ObjectId") {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/expirience
//@desc Add expirience in profile
//@access Private

router.put(
  "/experience",
  [
    auth,
    [
      body("title", "Title is required").not().isEmpty(),
      body("company", "Company is required").not().isEmpty(),
      body("from", "From date is required").not().isEmpty(),
      body("current", "Current date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExpirience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) return res.status(404).json({ msg: "Profile not found" });

      profile.experience.unshift(newExpirience);
      await profile.save();

      res.status(200).json(profile);
    } catch (e) {
      if (e.kind === "ObjectId")
        return res.status(500).json({ msg: "Profile is not valid" });
      console.error(e);
      res.status(500).send("Server Error");
    }
  }
);

//@route PUT api/profile/eduaction
//@desc PUT eduaction in profile
//@access Private

router.put(
  "/education",
  [
    auth,
    [
      body("school", "School is required").not().isEmpty(),
      body("degree", "Degree is required").not().isEmpty(),
      body("fieldofstudy", "FieldOfStudy is required").not().isEmpty(),
      body("from", "From is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (!profile) return res.status(500).send("Server error");

      profile.education.unshift(newEducation);

      await profile.save();

      res.status(200).json(profile);
    } catch (e) {
      if (e.kind === "ObjectId")
        return res.status(500).json({ msg: "Profile is not valid" });
      console.error(e);
      res.status(500).send("Server Error");
    }
  }
);

//@route DELETE api/profile/expirience
//@desc DELETE expirience in profile
//@access Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(500).send("Server error");

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ errors: e });
  }
});

//@route DELETE api/profile/education/:edu_id
//@desc DELETE education in profile
//@access Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(500).send("Server error");

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json({ profile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errors: e });
  }
});

//@route GET api/profile/github/:username
//@desc Get user repos from GitHub
//@access Public

router.get("/github/:username", async (req, res) => {
  try {
    const result = await request({
      method: "GET",
      url: `/users/${req.params.username}/repos?sort=created&per_page=5`,
      headers: {
        authorization: process.env.SECRET_TOKEN_GITHUB,
      },
      org: "octokit",
      type: "private",
    });

    if (result.status !== 200)
      return res.status(404).json({ msg: "Profile not Found" });

    res.status(200).json(result.data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erors: e });
  }
});

module.exports = router;
