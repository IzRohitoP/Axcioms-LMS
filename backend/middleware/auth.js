const { StatusCodes } = require("http-status-codes");
const CustomError = require("./CustomError");
const jwt = require("jsonwebtoken");
const user = require("../model/userModel");

exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new CustomError(
      "Please Login to access this resource",
      StatusCodes.UNAUTHORIZED
    );
  }

  const decodeData = jwt.verify(token, process.env.SECRET_KEY);
  req.user = await user.findById(decodeData.id);
  next();
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError(
        `Role: ${req.user.role} is not allowed to access this resource`,
        StatusCodes.FORBIDDEN
      );
    }
    next();
  };
};
