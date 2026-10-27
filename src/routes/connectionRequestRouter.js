const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id.toString();
      const toUserId = req.params.toUserId.toString();
      const status = req.params.status;

      // To check if statuses are of send route
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      // Check if the toUserId is valid or exists in db
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      // Check if there is an existing connection request ( A -> B / B -> A)
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request Already Exists!!!" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({ message: "Connection Request Sent Successfully", data });
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  },
);

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { requestId, status } = req.params;

      // status should be from allowed
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }

      // status should be interested
      // loggedInuser should be toUserId
      // requiestId should be valid
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        status: "interested",
        toUserId: loggedInUser._id,
      });

      if (connectionRequest) {
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: "Connection Request " + status, data });
      } else {
        res.status(404).json({ message: "Connection Request not found" });
      }
    } catch (error) {
      res.status(400).send("ERROR: " + error.message);
    }
  },
);

module.exports = { connectionRequestRouter };
