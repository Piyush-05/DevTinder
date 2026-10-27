const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_FOREIGN_FIELDS =
  "firstName lastName skills photoUrl age gender skills about";

// Get All the pending requests
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FOREIGN_FIELDS);

    if (pendingRequests.length > 0) {
      res.json({
        data: pendingRequests,
        message: `You have ${pendingRequests.length} pending requests.`,
      });
    } else {
      res.json({
        message: `${pendingRequests.length} pending requests.`,
      });
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FOREIGN_FIELDS)
      .populate("toUserId", USER_SAFE_FOREIGN_FIELDS);

    const data = allConnections.map((connection) => {
      if (
        connection.fromUserId._id.toString() === loggedInUser._id.toString()
      ) {
        return connection.toUserId;
      } else {
        return connection.fromUserId;
      }
    });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Display all the documents in User model except
    // 1. loggedInUser
    // 2. his connections
    // 3. ignored profiles
    // 4. already sent/interested profiles

    // all the requests sent + received
    const requests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hiddenConnections = new Set();
    requests.forEach((req) => {
      hiddenConnections.add(req.fromUserId);
      hiddenConnections.add(req.toUserId);
    });

    const users = await User({
      $and: [
        { _id: { $nin: Array.from(hiddenConnections) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_FOREIGN_FIELDS)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = { userRouter };
