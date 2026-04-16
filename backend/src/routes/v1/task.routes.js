const express = require("express");
const { body, param, query } = require("express-validator");
const taskController = require("../../controllers/taskController");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");
const authorize = require("../../middlewares/authorize");

const router = express.Router();

router.use(auth);

router.get(
  "/admin/stats",
  authorize("admin"),
  asyncHandler(taskController.adminStats)
);

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["pending", "in_progress", "done"]),
    query("search").optional().isString().trim().isLength({ max: 120 }),
    query("owner").optional().isMongoId(),
  ],
  validate,
  asyncHandler(taskController.list)
);

router.post(
  "/",
  [
    body("title").trim().isLength({ min: 2, max: 120 }),
    body("description").optional().isString().trim().isLength({ max: 1000 }),
    body("status").optional().isIn(["pending", "in_progress", "done"]),
    body("dueDate").optional({ nullable: true }).isISO8601(),
  ],
  validate,
  asyncHandler(taskController.create)
);

router.get(
  "/:id",
  [param("id").isMongoId()],
  validate,
  asyncHandler(taskController.getById)
);

router.put(
  "/:id",
  [
    param("id").isMongoId(),
    body("title").optional().trim().isLength({ min: 2, max: 120 }),
    body("description").optional().isString().trim().isLength({ max: 1000 }),
    body("status").optional().isIn(["pending", "in_progress", "done"]),
    body("dueDate").optional({ nullable: true }).isISO8601(),
  ],
  validate,
  asyncHandler(taskController.update)
);

router.delete(
  "/:id",
  [param("id").isMongoId()],
  validate,
  asyncHandler(taskController.remove)
);

module.exports = router;
