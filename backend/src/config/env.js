const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 5001),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/intern_assignment",
  jwtSecret: process.env.JWT_SECRET || "replace-this-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  adminInviteCode: process.env.ADMIN_INVITE_CODE || "ADMIN-ACCESS-CODE",
};
