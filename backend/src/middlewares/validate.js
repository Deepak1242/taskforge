const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array();
    const firstMessage = details[0]?.msg || "Validation failed";
    return next(new ApiError(400, String(firstMessage), details));
  }
  return next();
}

module.exports = validate;
