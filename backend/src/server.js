const mongoose = require("mongoose");
const app = require("./app");
const { mongoUri, port } = require("./config/env");

async function start() {
  try {
    await mongoose.connect(mongoUri);
    app.listen(port, () => {
      console.log(`Backend server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
