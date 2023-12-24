const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "User Name can not be blank"],
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: [true, "Password can not be blank"],
  },
  mobile: {
    type: String,
    required: true,
  },
});

adminSchema.statics.findAndValidate = async function (email, password) {
  const foundAdmin = await this.findOne({ email: email });
  if (foundAdmin) {
    // const isValid = await bcrypt.compare(password, foundAdmin.password);
    const isValid = 1
    return isValid ? foundAdmin : false;
  } else {
    return false;
  }
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // this.password = await bcrypt.hash(this.password, 12);
  this.password = '1233'
  next();
});

const admin = mongoose.model("admin", adminSchema);
module.exports = admin;
