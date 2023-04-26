const express = require("express");
const router = new express.Router();
const userdb = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

router.post("/register", async (req, res) => {
  const { fname, email, password, cpassword } = req.body;

  if (!fname || !email || !password || !cpassword) {
    res.status(422).json({ error: "fill all the details" });
  }
  try {
    const preuser = await userdb.findOne({ email: email });
    if (preuser) {
      res.status(422).json({ error: "This email already exists" });
    } else if (password !== cpassword) {
      res
        .status(422)
        .json({ error: "Password and confirm password doesn't matches" });
    } else {
      const finaluser = new userdb({
        fname,
        email,
        password,
        cpassword,
      });
      const storeData = await finaluser.save();
      // console.log(storeData);
      res.status(201).json({ status: 201, storeData });
    }
  } catch (err) {
    res.status(422).json(err);
  }
});

router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({ error: "fill all the details" });
  }
  try {
    const userValid = await userdb.findOne({ email: email });
    if (userValid) {
      const isMatch = await bcrypt.compare(password, userValid.password);
      if (!isMatch) {
        res.status(422).json({ error: "Invalid user" });
      } else {
        //token generate
        const token = await userValid.generateAuthtoken();

        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 900000),
          httpOnly: true,
        });
        const result = {
          userValid,
          token,
        };
        res.status(201).json({ status: 201, result });
      }
    }
  } catch (err) {
    res.status(201).json(err);
    console.log(err);
  }
});

//user valid
router.get("/validateuser", authenticate, async (req, res) => {
  try {
    const ValidUserOne = await userdb.findOne({ _id: req.userId });
    res.status(201).json({ status: 201, ValidUserOne });
  } catch (err) {
    res.status(401).json({ status: 401, err });
  }
});

//user logout
router.get("/logout", authenticate, async (req, res) => {
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token;
    });
    res.clearCookie("usercookie", { path: "/" });
    req.rootUser.save();
    res.status(201).json({ status: 201 });
  } catch (err) {
    res.status(201).json({ status: 401, err });
  }
});

module.exports = router;
