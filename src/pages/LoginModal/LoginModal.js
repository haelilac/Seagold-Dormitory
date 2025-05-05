import React, { useState } from "react";
import "./LoginModal.css";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVenusMars } from '@fortawesome/free-solid-svg-icons'; // this one is for gender

const LoginModal = ({ onClose, onLogin }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const idToken = result.user.accessToken;
        return fetch("https://seagold-laravel-production.up.railway.app/api/google-login-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        });
      })
      .then((response) => {
        if (!response.ok) throw new Error("Google login failed");
        return response.json();
      })
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("role", "guest");
          onLogin();
          onClose();
        } else {
          setErrorMessage("Google login failed. Please try again.");
        }
      })
      .catch(() => setErrorMessage("Google sign-in failed. Please try again."))
      .finally(() => setGoogleLoading(false));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setFormLoading(true);
    fetch("https://seagold-laravel-production.up.railway.app/api/login-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          onLogin();
          onClose();
        } else {
          setErrorMessage(data.error || "Invalid credentials.");
        }
      })
      .catch(() => setErrorMessage("Failed to log in."))
      .finally(() => setFormLoading(false));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    fetch("https://seagold-laravel-production.up.railway.app/api/register-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        date_of_birth: dateOfBirth,
        gender,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setSuccessMessage("Account created successfully! You can now log in.");
          setIsRegisterMode(false);
          setName("");
          setEmail("");
          setPassword("");
          setDateOfBirth("");
          setGender("");
        } else {
          setErrorMessage(data.error || "Failed to create an account.");
        }
      })
      .catch(() => setErrorMessage("Failed to create an account. Please try again later."));
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-login-button" onClick={onClose}>
          &times;
        </button>

        <div className="logo-container">
          <img src={require("../../assets/seagoldlogo.png")} alt="Logo" className="logo" />
        </div>

        <div className="tab-navigation">
          <span
            className={`tab ${isRegisterMode ? "active" : ""}`}
            onClick={() => setIsRegisterMode(true)}
          >
            Sign Up
          </span>
          <span
            className={`tab ${!isRegisterMode ? "active" : ""}`}
            onClick={() => setIsRegisterMode(false)}
          >
            Sign In
          </span>
        </div>

        {isRegisterMode ? (
          <form onSubmit={handleRegister}>
            <h2 className="form-title">Create An Account</h2>
            <div className="input-row">
              <div className="input-container">
                <img src={require("../../assets/user-icon.png")} alt="User" className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-container">
                <img src={require("../../assets/user-icon.png")} alt="Email" className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="input-container">
              <img src={require("../../assets/lock-icon.png")} alt="Password" className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-row">
              <div className="input-container">
                <img
                  src={require("../../assets/calendar-icon.png")}
                  alt="Date of Birth"
                  className="input-icon"
                />
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="input-container select-with-icon">
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <button type="submit" className="form-button" disabled={formLoading}>
              {formLoading ? <span className="spinner" /> : isRegisterMode ? "Register" : "Sign In"}
            </button>
            <div className="divider-text">
             <span>Or sign up with</span>
            </div>
            <button className="google-login-button" onClick={handleGoogleLogin} disabled={googleLoading}>
              {googleLoading ? (
                <span className="spinner" />
              ) : (
                <>
                  <img src={require("../../assets/google-icon.png")} alt="Google" />
                  {isRegisterMode ? "Sign up with Google" : "Sign in with Google"}
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h2 className="form-title">Login</h2>
            <div className="input-container">
              <img src={require("../../assets/user-icon.png")} alt="Email" className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <img src={require("../../assets/lock-icon.png")} alt="Password" className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="form-button">
              Sign In
            </button>
            <div className="divider-text">
              <span>Or</span>
            </div>
            <button className="google-login-button" onClick={handleGoogleLogin}>
              <img src={require("../../assets/google-icon.png")} alt="Google" />
              Sign in with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
