const authService = require("../services/authService");

async function register(req, res) {
  const data = await authService.register({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    adminCode: req.body.adminInviteCode,
  });

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data,
  });
}

async function login(req, res) {
  const data = await authService.login({
    email: req.body.email,
    password: req.body.password,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data,
  });
}

async function me(req, res) {
  const data = await authService.getProfile(req.user._id);

  return res.status(200).json({
    success: true,
    data,
  });
}

module.exports = {
  register,
  login,
  me,
};
