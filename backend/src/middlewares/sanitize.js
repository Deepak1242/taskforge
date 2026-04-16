const ApiError = require("../utils/apiError");

function assertSafeKeys(value) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(assertSafeKeys);
    return;
  }

  Object.keys(value).forEach((key) => {
    if (key.includes("$") || key.includes(".")) {
      throw new ApiError(400, "Payload contains forbidden key characters");
    }
    assertSafeKeys(value[key]);
  });
}

function sanitize(req, res, next) {
  try {
    assertSafeKeys(req.body);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = sanitize;
