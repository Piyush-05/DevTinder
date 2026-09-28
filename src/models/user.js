const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 18,
      trim: true,
    },
    lastName: { type: String, minLength: 2, maxLength: 18, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    age: { type: Number, min: 18, max: 100 },
    gender: {
      type: String,
      validate: (value) => {
        if (!["male", "female", "others"].include(value))
          return "Please enter valid gender";
      },
    },
    skills: [String],
    photoUrl: {
      type: String,
      default:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJwAAACUCAMAAABRNbASAAAAMFBMVEX///++v8Hx8fG4ubv8/PzGx8m7vL709PT4+Pju7u7U1NTDxMXQ0NDj4+Pe3t7m5uaQcNhZAAAD+ElEQVR4nO2c23LrIAxFY4Px3fn/vy12mri+SoINOXNG+6lPzKqwJCRBHg+VSqVSqVQqlerbskAhuZppqMAaxhpBVo+FcbMKqIwpxiaWberBVKtcP8aZrTKp0GY6U0VsblskM9svXt+Gsj1Ts80KpKvRTnAm54J2tqkysHm6KiTsdVnYfFDpAgyX0k+3dNJ4Zx9DJsP5jR2khqv7XGw+nkh9YsxmOE8nzRS53GGBE7qEzberXr0smthsvjrLyODyBZIFThZMyrxwpcIpnMIp3Kylduy95j//LThfR3VjWzZeZTt2lTMiwJRwrujqTQKydSeyXzo4109nK0w9f4lkcKa7SIxNx18jDZy5q4pbbisjDRzRT+BWl0ng3EAcxCyvTEoB5ypyHcuyXQI41zPOiKydxcMxuxz1V+DMaXg7aqKzBRyOdIaPaKfAw7Eba212OEmDgzQdGs4IOpIt9dWB4ZykSCeDHRqO6aovTXnhZH3mZ1Y40a76NEG0hcCWo7PqRlVWywk7akS3DwvHTV1vTcRyWDhho3TMCveUwT0V7r2a8JvLuq2yBEGmCDCccOgy3K6GhhMG4awZQjgRomZV6FOJyF3zJn5h/qJmVfAaQjDXaKi14Md0wb6SE0i45QT+Sg754NUXf0hKj27xcNzDMKNbkqBXwswSjC5Yii4TyyeoGJcIjlWCsa5DJWkeFmQSa1jXodK0XXti1ZLXsk7TsHb3O/tkTkqSzSFujp1UFyI5nDNXt7hsxR6AJRuSXF9brcfe8PY1kUPc1RLeouPXHMJdjr1WNaxrRwnSV9FysisnCuMTf8dM/JaeHsIPm4LKlWjjwKsvYWeT2FpwO0J4u7e9DylIOKHdFrpslpPabaG7XRAHJ75iueiuksDBSdtfb90cA2BwRtjDWTVcrwmCC7tKvsheNvxhcMEPGG5mmyA46QBiq6tTAAZOOFbay16coEBwwi76Xs+ElpPfv9/rvPyHwIWkBta6ALg4b3jp1CcgcNGGuzgYA+Div7jHxdUrAFz8Fzfr7HgSD+eKB+Tt58m+CuFOnhyEnkb2OqkohE8Ozh5ryP69S5UnlhO+JDkmGvbFKmrpo0tIk+IhHkmnmNc6nDrZJfBbh1N12IPFMzWHpaXn/sOgr0exHYYmjO7tVna/r4jU9Vb80rtggonAL+3isPghpNe2/+Kin46vqrdsIXuyGQvxb2gytLlPF1gx/X22jPzkth9daBT40+DARblZa6QLaLt86HyeeK0TWzxs9ZmHRbD9/ZEBoLOuWxL1IwOP5UHI8m8CnfXXXZ257cXzFlp+2CKuXt3LFs6ZAvPDG800ICOJ1zDE/+SGSqVSqVQqlUr13+oH70Uyu/s3t1oAAAAASUVORK5CYII=",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "30LPA", {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInput) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(passwordInput, passwordHash);
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
