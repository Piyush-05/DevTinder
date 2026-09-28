const User = require("../models/user");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("Invalid token");

    const decodedMsg = jwt.verify(token, "30LPA");
    const { _id } = decodedMsg;

    const user = await User.findById(_id);
    if (!user) throw new Error("User doesn't exist");

    console.log("Logged in user is: " + user.firstName + " " + user.lastName);
    req.user = user;

    next();
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
};

module.exports = {
  userAuth,
};
