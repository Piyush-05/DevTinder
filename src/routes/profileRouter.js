const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/helper");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

// TODO : /profile/edit api

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req.body)) {
      throw new Error("Invalid Edit Request");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(
      (field) => (loggedInUser[field] = req.body[field]),
    );
    await loggedInUser.save();
    res.send(
      `${loggedInUser.firstName}, your profile has been updated successfully.`,
    );
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

// TODO: change password api

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const loggedInUser = req.user;

    if (oldPassword === newPassword) {
      throw new Error("Please enter new password");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter strong password");
    }

    // match the existing password
    const isPasswordValid = await loggedInUser.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error("Invalid Password");
    }

    // create new password hash
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // save updated hash to db
    loggedInUser.password = passwordHash;
    await loggedInUser.save();
    res.send(
      `${loggedInUser.firstName}, your password has been updated successfully.`,
    );
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = { profileRouter };
