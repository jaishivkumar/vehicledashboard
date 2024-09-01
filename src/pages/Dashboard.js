import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect to login page after logout
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
        <NavLink to="/users">Users</NavLink>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
      <div className="dashboard-content">
        <h2>Welcome, {currentUser ? currentUser.email : "User"}!</h2>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
