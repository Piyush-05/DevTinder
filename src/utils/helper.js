const validate = require("validator");

const validateSignUpdata = (data) => {
  const { firstName, lastName, email, password } = data;
  if (!firstName) {
    throw new Error("First name is required");
  }
  if (!validate.isEmail(email)) {
    throw new Error("Email is invalid");
  }
  if (!validate.isStrongPassword(password)) {
    throw new Error("Please enter strong password");
  }
};

module.exports = {
  validateSignUpdata,
};
