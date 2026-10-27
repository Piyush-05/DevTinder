const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/helper");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    // validate the data
    validateSignUpData(req.body);

    // encrypt password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create user
    // Creating the new instance of model. Instance of Model is the document.
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    await user.save();
    res.send("User added to the database.");
  } catch (error) {
    // Catch MongoDB's duplicate key error code
    if (error.code === 11000) {
      return res.status(400).send("ERROR: Email is already registered.");
    }
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) throw new Error("Invalid credentials");

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 3600000),
      });
      res.send("Login successfull!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

authRouter.get("/logout", (req, res) => {
  res
    .clearCookie("token", null, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now()),
    })
    .send("User logged out successfully.");
});

// TODO: reset password api

module.exports = { authRouter };
