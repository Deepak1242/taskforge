const mongoose = require("mongoose");
const Task = require("../models/Task");
const ApiError = require("../utils/apiError");

function parsePaging({ page = "1", limit = "10" }) {
  const parsedPage = Math.max(Number(page) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  return { parsedPage, parsedLimit };
}

function buildQuery(user, query) {
  const filter = {};

  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.owner && user.role === "admin" && mongoose.Types.ObjectId.isValid(query.owner)) {
    filter.owner = query.owner;
  }

  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  return filter;
}

async function listTasks(user, query) {
  const { parsedPage, parsedLimit } = parsePaging(query);
  const filter = buildQuery(user, query);

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate("owner", "_id name email role")
      .sort({ createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit),
    Task.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit),
    },
  };
}

async function createTask(user, payload) {
  const task = await Task.create({
    ...payload,
    owner: user._id,
  });

  return Task.findById(task._id).populate("owner", "_id name email role");
}

async function getTaskById(user, taskId) {
  const task = await Task.findById(taskId).populate("owner", "_id name email role");
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (user.role !== "admin" && task.owner._id.toString() !== user._id.toString()) {
    throw new ApiError(403, "You can only access your own tasks");
  }

  return task;
}

async function updateTask(user, taskId, payload) {
  const task = await getTaskById(user, taskId);

  if (payload.title !== undefined) {
    task.title = payload.title;
  }
  if (payload.description !== undefined) {
    task.description = payload.description;
  }
  if (payload.status !== undefined) {
    task.status = payload.status;
  }
  if (payload.dueDate !== undefined) {
    task.dueDate = payload.dueDate || null;
  }

  await task.save();

  return task;
}

async function deleteTask(user, taskId) {
  const task = await getTaskById(user, taskId);
  await task.deleteOne();
  return { deleted: true };
}

async function getAdminStats() {
  const [totalTasks, grouped] = await Promise.all([
    Task.countDocuments({}),
    Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const byStatus = grouped.reduce(
    (acc, item) => ({
      ...acc,
      [item._id]: item.count,
    }),
    { pending: 0, in_progress: 0, done: 0 }
  );

  return {
    totalTasks,
    byStatus,
  };
}

module.exports = {
  listTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getAdminStats,
};
