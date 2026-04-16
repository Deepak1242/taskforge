import React, { useState } from "react";
import { request } from "../api/client";
import BrandPanel from "../components/BrandPanel";
import Message from "../components/Message";
import { setToken } from "../utils/storage";

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
              {fieldErrors.adminInviteCode ? <small className="field-feedback">{fieldErrors.adminInviteCode}</small> : null}
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

export default AuthPage;