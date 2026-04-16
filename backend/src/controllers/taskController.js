const taskService = require("../services/taskService");

async function list(req, res) {
  const data = await taskService.listTasks(req.user, req.query);
  return res.status(200).json({ success: true, data });
}

async function create(req, res) {
  const data = await taskService.createTask(req.user, req.body);
  return res.status(201).json({
    success: true,
    message: "Task created",
    data,
  });
}

async function getById(req, res) {
  const data = await taskService.getTaskById(req.user, req.params.id);
  return res.status(200).json({ success: true, data });
}

async function update(req, res) {
  const data = await taskService.updateTask(req.user, req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: "Task updated",
    data,
  });
}

async function remove(req, res) {
  const data = await taskService.deleteTask(req.user, req.params.id);
  return res.status(200).json({
    success: true,
    message: "Task deleted",
    data,
  });
}

async function adminStats(req, res) {
  const data = await taskService.getAdminStats();
  return res.status(200).json({ success: true, data });
}

module.exports = {
  list,
  create,
  getById,
  update,
  remove,
  adminStats,
};
