import React from "react";

const TaskListSkeleton = () => (
  <div className="task-list skeleton-list" aria-label="Loading tasks">
    {Array.from({ length: 3 }).map((_, index) => (
      <article className="task-card skeleton-card" key={index}>
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-meta" />
      </article>
    ))}
  </div>
);

export default TaskListSkeleton;