const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username can not be blank"],
  },
  email: {
    type: String,
    required: [true, "Email can not be black"],
  },
  password: {
    type: String,
    required: [true, "Password can not be blank"],
  },
  mobile: {
    type: String,
  },
  dob: {
    type: Date,
  },
});

userSchema.statics.findAndValidate = async function (email, password) {
  const foundUser = await this.findOne({ email: email });
  if (foundUser) {
    // const isValid = await bcrypt.compare(password, foundUser.password);
    const isValid = 1
    return isValid ? foundUser : false;
  } else {
    return false;
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // this.password = await bcrypt.hash(this.password, 12);
  this.password = '1234r'
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
