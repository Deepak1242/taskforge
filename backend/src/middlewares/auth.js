const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");
const ApiError = require("../utils/apiError");

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new ApiError(401, "Missing or invalid authorization header"));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.userId).select("_id name email role");

    if (!user) {
      return next(new ApiError(401, "User not found for this token"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = auth;
