const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const sanitize = require("./middlewares/sanitize");
const v1Routes = require("./routes/v1");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const swaggerDocument = YAML.load(`${__dirname}/docs/swagger.yaml`);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(sanitize);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to TaskForge API" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", v1Routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
