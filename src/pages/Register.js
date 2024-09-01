import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Correctly import auth from firebaseConfig
import { createUserWithEmailAndPassword } from "firebase/auth";
import '../styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Ensure email and password are not empty
    if (!email || !password) {
      setError("Email and password cannot be empty.");
      return;
    }

    try {
      // Use Firebase Auth to create a new user
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      setError(err.message);
      console.error("Error during registration:", err);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
