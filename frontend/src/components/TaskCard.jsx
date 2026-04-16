import React from "react";

import { getStatusLabel } from "../utils/constants";

const TaskCard = ({ task, onMove, onDelete }) => {
  const nextStatus = task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "done" : "pending";

  return (
    <article className="task-card">
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge ${task.status}`}>{getStatusLabel(task.status)}</span>
      </div>
      <p className="task-description">{task.description || "No description added."}</p>
      <p className="task-meta">Owner: {task.owner?.email || "Unknown"}</p>
      <div className="task-actions">
        <button className="secondary-action" type="button" onClick={() => onMove(task._id, nextStatus)}>
          Move to {getStatusLabel(nextStatus)}
        </button>
        <button className="danger-action" type="button" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </article>
  );
};

export default TaskCard;