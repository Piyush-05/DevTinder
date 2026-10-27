const validator = require("validator");

const validateSignUpData = (data) => {
  const { firstName, lastName, email, password } = data;
  if (!firstName) {
    throw new Error("First name is required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter strong password");
  }
};

const validateProfileEditData = (data) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "about",
    "photoUrl",
  ];

  const isEditAllowed = Object.keys(data).every((field) =>
    allowedFields.includes(field),
  );
  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateProfileEditData,
};
