const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const { jwtSecret, jwtExpiresIn, adminInviteCode } = require("../config/env");

function createToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

async function register({ name, email, password, role = "user", adminCode }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  if (role === "admin" && adminCode !== adminInviteCode) {
    throw new ApiError(403, "Invalid admin invite code");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role === "admin" ? "admin" : "user",
  });

  const token = createToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = createToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function getProfile(userId) {
  const user = await User.findById(userId).select("_id name email role createdAt");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = {
  register,
  login,
  getProfile,
};
