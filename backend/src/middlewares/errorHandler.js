const ApiError = require("../utils/apiError");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

module.exports = errorHandler;
