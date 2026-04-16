import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import brandLogo from "./logo-removebg-preview.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";
const PRODUCT_NAME = "TaskFoundry";

const defaultFilters = {
  status: "",
  search: "",
};

const getToken = () => localStorage.getItem("token") || "";
const setToken = (token) => localStorage.setItem("token", token);
const clearToken = () => localStorage.removeItem("token");

const getStatusLabel = (status) => status.replace("_", " ");

const request = async (path, options = {}) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearToken();
    const error = new Error(data.message || "Request failed");
    error.details = data.details || [];
    error.status = response.status;
    throw error;
  }

  return data;
};

const BrandPanel = () => (
  <aside className="brand-panel" aria-label={`${PRODUCT_NAME} overview`}>
    <div className="brand-top">
      <div className="brand-mark" aria-hidden="true">
        <img className="brand-logo" src={brandLogo} alt="" />
      </div>
      <p className="eyebrow">Task operations workspace</p>
    </div>
    <div>
      <h1>{PRODUCT_NAME}</h1>
      <p className="brand-copy">
        Sign in, capture work, and keep every task moving through a clean operational flow.
      </p>
    </div>
    <div className="brand-rhythm" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  </aside>
);

const Message = ({ message, reserveSpace = false }) => {
  if (!message?.text && !reserveSpace) return null;
  return <div className={`message ${message?.type || "placeholder"}`}>{message?.text || "\u00A0"}</div>;
};

const AuthPage = ({ mode, onModeChange, onAuth }) => {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminInviteCode: "",
  });
  const [message, setMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            role: form.role,
            adminInviteCode: form.adminInviteCode || undefined,
          };

      const data = await request(isLogin ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!isLogin) {
        sessionStorage.setItem("signupSuccessToast", "Account created successfully. Welcome to TaskFoundry.");
      }

      setToken(data.data.token);
      onAuth(data.data.user);
    } catch (error) {
      if (!isLogin && Array.isArray(error.details) && error.details.length) {
        const nextFieldErrors = {};
        for (const detail of error.details) {
          const field = detail.path;
          if (!field || nextFieldErrors[field]) continue;
          nextFieldErrors[field] = String(detail.msg || "Invalid value");
        }
        setFieldErrors(nextFieldErrors);
      }
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <BrandPanel />
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className={`auth-copy ${isLogin ? "is-login" : ""}`}>
          <p className="eyebrow">{isLogin ? "Login" : "Register"}</p>
          <h2 id="auth-title">{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p>
            {isLogin
              ? "Open your workspace and continue tracking active tasks."
              : "Create a user account, or use the invite code to register as an admin."}
          </p>
        </div>

        <form className={`form-card ${isLogin ? "is-login" : ""}`} onSubmit={submit}>
          <label className={`field ${isLogin ? "is-hidden" : ""}`} aria-hidden={isLogin}>
            <span>Name</span>
            {fieldErrors.name ? <small className="field-feedback">{fieldErrors.name}</small> : null}
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              placeholder="Alice Morgan"
              required={!isLogin}
              disabled={isLogin}
            />
          </label>

          <label className="field">
            <span>Email</span>
            {fieldErrors.email ? <small className="field-feedback">{fieldErrors.email}</small> : null}
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              placeholder="alice@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            {fieldErrors.password ? <small className="field-feedback">{fieldErrors.password}</small> : null}
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="StrongPass1"
              required
            />
          </label>

          <div className={`split-fields ${isLogin ? "is-hidden" : ""}`} aria-hidden={isLogin}>
            <label className="field">
              <span>Role</span>
              {fieldErrors.role ? <small className="field-feedback">{fieldErrors.role}</small> : null}
              <select value={form.role} onChange={(event) => updateField("role", event.target.value)} disabled={isLogin}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="field">
              <span>Invite code</span>
              {fieldErrors.adminInviteCode ? (
                <small className="field-feedback">{fieldErrors.adminInviteCode}</small>
              ) : null}
              <input
                value={form.adminInviteCode}
                onChange={(event) => updateField("adminInviteCode", event.target.value)}
                placeholder="Admins only"
                disabled={isLogin}
              />
            </label>
          </div>

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : isLogin ? "Sign in" : "Create account"}
          </button>
          <Message message={message} reserveSpace />
        </form>

        <div className="auth-switch">
          <span>{isLogin ? "Need an account?" : "Already have an account?"}</span>
          <button className="text-action" type="button" onClick={() => onModeChange(isLogin ? "register" : "login")}>
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
};

const Metric = ({ label, value }) => (
  <article className="metric">
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

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

const EmptyState = () => (
  <div className="empty-state">
    <h3>No tasks found</h3>
    <p>Create a task or adjust the filters to see work here.</p>
  </div>
);

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

const Dashboard = ({ user, onLogout }) => {
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

const App = () => {
  const [mode, setMode] = useState(getToken() ? "dashboard" : "login");
  const [user, setUser] = useState(null);

  const handleAuth = (nextUser) => {
    setUser(nextUser);
    setMode("dashboard");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setMode("login");
  };

  if (mode === "dashboard" && getToken()) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  return <AuthPage mode={mode} onModeChange={setMode} onAuth={handleAuth} />;
};

createRoot(document.querySelector("#app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
