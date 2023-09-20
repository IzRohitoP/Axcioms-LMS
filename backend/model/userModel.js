const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY="23nkj2n3k6jnasdh91h931-ksopkaspok121p";
const TOKEN_EXPIRE="5d";
const userSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: [true, "Please enter the user ID"],
  },
  role: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter the password"],
    select: false,
  },
  issuedBooks: [
    {
      serialno: {
        type: String,
        required: [true, "Please enter the book serial no"],
      }
    },
  ],
});

// For hashing
userSchema.pre("save", async function (next) {
  // checks if password is not modified that means its already hashed but if it is modified then a non-hashede passowrd has been provided by user which we have to hash again
  if (!this.isModified("password")) {
    // checks if password not modified
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Get JWT token
userSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, SECRET_KEY, {
    expiresIn: TOKEN_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = function (givenPassword) {
  return bcrypt.compare(givenPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
