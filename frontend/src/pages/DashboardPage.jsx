import React, { useEffect, useMemo, useState } from "react";
import { request } from "../api/client";
import EmptyState from "../components/EmptyState";
import Message from "../components/Message";
import Metric from "../components/Metric";
import TaskCard from "../components/TaskCard";
import TaskListSkeleton from "../components/TaskListSkeleton";
import brandLogo from "../logo-removebg-preview.png";
import { defaultFilters } from "../utils/constants";
import { getToken } from "../utils/storage";

const DashboardPage = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(user);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", status: "pending" });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const metrics = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      active: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks]
  );

  const fetchTasks = async (activeFilters = filters) => {
    const params = new URLSearchParams();
    if (activeFilters.status) params.set("status", activeFilters.status);
    if (activeFilters.search) params.set("search", activeFilters.search);

    const data = await request(`/tasks${params.toString() ? `?${params.toString()}` : ""}`);
    setTasks(data.data.items || []);
  };

  const loadDashboard = async (activeFilters = filters) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const [profileData] = await Promise.all([request("/auth/me"), fetchTasks(activeFilters)]);
      setProfile(profileData.data);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      if (!getToken()) onLogout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(defaultFilters);
  }, []);

  useEffect(() => {
    const signupToast = sessionStorage.getItem("signupSuccessToast");
    if (!signupToast) return;

    setToast({ type: "success", text: signupToast });
    sessionStorage.removeItem("signupSuccessToast");
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const createTask = async (event) => {
    event.preventDefault();
    setMessage(null);

    try {
      await request("/tasks", {
        method: "POST",
        body: JSON.stringify(taskForm),
      });
      setTaskForm({ title: "", description: "", status: "pending" });
      await fetchTasks(filters);
      setToast({ type: "success", text: "Task added successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const moveTask = async (taskId, status) => {
    setMessage(null);

    try {
      await request(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      await fetchTasks(filters);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const deleteTask = async (taskId) => {
    setMessage(null);

    try {
      await request(`/tasks/${taskId}`, { method: "DELETE" });
      await fetchTasks(filters);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    const nextFilters = {
      status: draftFilters.status,
      search: draftFilters.search.trim(),
    };

    setFilters(nextFilters);
    await loadDashboard(nextFilters);
  };

  return (
    <main className="workspace">
      {toast ? (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      ) : null}

      <header className="topbar">
        <div className="topbar-title">
          <div className="brand-line">
            <span className="brand-mark compact" aria-hidden="true">
              <img className="brand-logo compact" src={brandLogo} alt="" />
            </span>
          </div>
          <h1>Task workspace</h1>
        </div>
        <div className="topbar-actions">
          <span className="user-pill">{profile ? `${profile.name} - ${profile.role}` : "Loading profile"}</span>
          <button className="secondary-action" type="button" onClick={() => loadDashboard(filters)}>
            Refresh
          </button>
          <button className="secondary-action" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="metrics-row" aria-label="Task summary">
        <Metric label="Total" value={metrics.total} />
        <Metric label="Pending" value={metrics.pending} />
        <Metric label="In progress" value={metrics.active} />
        <Metric label="Done" value={metrics.done} />
      </section>

      <section className="workspace-grid">
        <aside className="task-composer" aria-labelledby="create-task-title">
          <p className="eyebrow">New task</p>
          <h2 id="create-task-title">Capture work</h2>
          <form className="form-card compact-form" onSubmit={createTask}>
            <label className="field">
              <span>Title</span>
              <input
                value={taskForm.title}
                onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Prepare launch notes"
                required
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                rows="5"
                placeholder="Add enough context for the next action."
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <button className="primary-action" type="submit">
              Add task
            </button>
          </form>
          <Message message={message} />
        </aside>

        <section className="task-board" aria-labelledby="task-board-title">
          <div className="board-header">
            <div>
              <p className="eyebrow">Main function</p>
              <h2 id="task-board-title">Plan and track</h2>
            </div>
            <form className="filters" onSubmit={applyFilters}>
              <label className="field inline-field">
                <span>Status</span>
                <select
                  value={draftFilters.status}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label className="field inline-field search-field">
                <span>Search</span>
                <input
                  value={draftFilters.search}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Find by title"
                />
              </label>
              <button className="secondary-action" type="submit">
                Apply
              </button>
            </form>
          </div>

          {isLoading ? (
            <TaskListSkeleton />
          ) : (
            <div className="task-list" aria-live="polite">
              {tasks.length ? (
                tasks.map((task) => <TaskCard key={task._id} task={task} onMove={moveTask} onDelete={deleteTask} />)
              ) : (
                <EmptyState />
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default DashboardPage;