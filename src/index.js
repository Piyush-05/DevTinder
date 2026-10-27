const express = require("express");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./configs/database");
const User = require("./models/user");
const { authRouter } = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const { connectionRequestRouter } = require("./routes/connectionRequestRouter");
const { userRouter } = require("./routes/userRouter");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);

app.get("/user/email", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length < 1) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

app.get("/user/id", async (req, res) => {
  try {
    const user = await User.find({ _id: req.body._id });
    if (user.length < 1) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    if (user.length < 1) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

app.patch("/edit", async (req, res) => {
  const userId = req.body._id;
  const data = req.body;
  try {
    const user = User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User added to the database.");
  } catch (error) {
    res.send("Failed to add the user to database.");
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Database connection failed.");
  });
