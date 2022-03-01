const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authJwt");

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", getUser, (req, res) => {
  res.json(res.user);
});

router.post("/signup", DuplicatedUsernameorEmail, async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      fullname: req.body.fullname,
      email: req.body.email,
      password: hashedPassword,
    });
 
   const newUser = await user.save();
    res.status(201).json(newUser);
    // console.log(salt)
    // console.log(hashedPassword)
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.post("/signin", async (req, res) => {
  try {
    User.findOne({ fullname: req.body.fullname }, (err, user) => {
      if (err) return handleError(err);
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      let token = jwt.sign(
        { id: customer.id },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: 86400, // 24 hours
        }
      );
      res.status(200).send({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        accessToken: token,
      });
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.patch("/:id", [getUser, verifyToken], async (req, res) => {
  if (req.params.id != req.userId) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
  if (req.body.fullname != null) {
    res.user.fullname = req.body.fullname;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;

}
  if (req.body.password != null) {
    res.user.password = req.body.password;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Deleted User" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Cannot find User" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

async function DuplicatedUsernameorEmail(req, res, next) {
  let user;

  try {
    user = await User.findOne({ fullname: req.body.fullname });
    email = await User.findOne({ email: req.body.email });
    if (user || email) {
      return res.status(404).send({ message: "username already exists" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  next();
}

module.exports = router;
