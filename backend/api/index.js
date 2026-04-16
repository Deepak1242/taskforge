const mongoose = require("mongoose");
const app = require("../src/app");
const { mongoUri } = require("../src/config/env");

let cachedConnection = null;

async function ensureDatabaseConnection() {
  if (cachedConnection || mongoose.connection.readyState === 1) {
    return;
  }

  cachedConnection = await mongoose.connect(mongoUri);
}

module.exports = async (req, res) => {
  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize backend",
      details: null,
    });
  }
};
