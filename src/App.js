import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Users from "./pages/Users";
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>}>
            <Route path="home" element={<Home />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;
