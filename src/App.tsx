import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import { ThreeBackground } from "./components/ThreeBackground";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/auth" />;
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial theme load
    const savedTheme = localStorage.getItem("app-theme");
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value as string);
        });
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    }

    // Listener for theme changes from other tabs/pages
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app-theme" && e.newValue) {
        const theme = JSON.parse(e.newValue);
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value as string);
        });
      }
    };
    window.addEventListener("storage", handleStorage);

    setIsReady(true);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!isReady) return null;

  return (
    <Router>
      <ThreeBackground />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/welcome" 
          element={
            <PrivateRoute>
              <Welcome />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
