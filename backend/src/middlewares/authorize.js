const ApiError = require("../utils/apiError");

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Not authenticated"));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "You are not allowed to perform this action"));
  }

  return next();
};

module.exports = authorize;
