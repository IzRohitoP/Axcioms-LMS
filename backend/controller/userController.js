const { StatusCodes } = require("http-status-codes");
const User = require("../model/userModel");
const CustomError = require("../middleware/CustomError");
const sendToken = require("../utils/jwtHelper");
const crypto = require("crypto");

// Register User
exports.registerUser = async (req, res, next) => {
  const { userid, password } = req.body;
  const user = await User.create({
    userid,
    password,
    avatar: {
      public_id: "Sample",
      url: "Sample URL",
    },
  });
  console.log(user);
  user.password = undefined;
  sendToken(user, StatusCodes.CREATED, res);
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    throw new CustomError(
      "Please Enter an email and password",
      StatusCodes.BAD_REQUEST
    );
  }
  const user = await User.findOne({ userid }).select("+password");
  if (!user) {
    throw new CustomError(
      "Provided Invalid email or Password",
      StatusCodes.UNAUTHORIZED
    );
  }

  // compare password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new CustomError(
      "Invalid email or Password",
      StatusCodes.UNAUTHORIZED
    );
  }
  user.password = undefined;
  sendToken(user, StatusCodes.OK, res);
};

exports.logoutUser = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({ success: true, message: "Logged Out" });
};
