import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { clearToken, getToken } from "./utils/storage";

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
    return <DashboardPage user={user} onLogout={logout} />;
  }

  return <AuthPage mode={mode} onModeChange={setMode} onAuth={handleAuth} />;
};

export default App;