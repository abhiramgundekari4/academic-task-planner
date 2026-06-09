import React, { useState } from "react";
import { API } from "./api";

function Auth() {
  const [activeRole, setActiveRole] = useState("student"); // "student" or "admin"
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);

  // Switch role and clear credentials
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setName("");
    setAdminKey("");
    setEmail("");
    setPassword("");
  };

  // registering new user account
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("All fields are required!");
      return;
    }
    if (activeRole === "admin" && !adminKey) {
      alert("Admin Security Key is required for administrator registration!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: activeRole }),
      });

      const data = await res.json();

      if (data.token) {
        // Always use the role from the backend response; only fallback if missing
        const confirmedRole = data.role || activeRole;
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", confirmedRole);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", name || email.split("@")[0]);
        console.log("Registered as role:", confirmedRole);
        window.location.reload(); // Auto-login
      } else {
        alert(data.msg || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed. Server is currently sleeping or offline. Please wait 10 seconds and try again!");
    } finally {
      setLoading(false);
    }
  };

  // authenticating user login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 400) {
        const errorMsg = await res.text();
        alert(errorMsg || "Invalid credentials");
        return;
      }

      const data = await res.json();

      if (data.token) {
        // Use the role returned by backend; fall back to the selected tab role if backend doesn't return it
        const confirmedRole = data.role || activeRole;
        
        // Only enforce mismatch if data.role was actually returned by the backend
        if (data.role && activeRole === "admin" && data.role === "student") {
          alert("Error: This account is registered as a Student. Please use Student Login or register a new Admin account.");
          setLoading(false);
          return;
        }
        if (data.role && activeRole === "student" && (data.role === "admin" || data.role === "faculty")) {
          alert("Error: This account is registered as an Admin/Faculty. Please use Admin Login.");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", confirmedRole);
        localStorage.setItem("userEmail", email);
        if (data.name) {
          localStorage.setItem("userName", data.name);
        } else if (data.user && data.user.name) {
          localStorage.setItem("userName", data.user.name);
        } else {
          localStorage.setItem("userName", email.split("@")[0]);
        }
        console.log("Logged in as role:", confirmedRole);
        window.location.reload();
      } else {
        alert(data.msg || "Login failed. Please register first!");
      }
    } catch (err) {
      console.error(err);
      alert("Server is currently sleeping or offline. Please wait 10 seconds and try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-250 w-full max-w-md">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm mb-3">
            <span className="text-xl font-bold text-white">STM</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight text-center">
            Smart Task Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">Upgrade Your Academic Operations</p>
        </div>

        {/* 2 DISTINCT LOGIN SELECTION BUTTONS */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-250 mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-all cursor-pointer font-bold ${
              activeRole === "student"
                ? "bg-blue-500 text-white shadow-sm font-extrabold"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-150"
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`flex-1 py-2 px-3 rounded-lg text-center transition-all cursor-pointer font-bold ${
              activeRole === "admin"
                ? "bg-red-500 text-white shadow-sm font-extrabold"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-150"
            }`}
          >
            Admin Login
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-700 text-center mb-6">
          {isLogin ? `${activeRole === "admin" ? "Admin" : "Student"} Login` : `Register as ${activeRole === "admin" ? "Admin" : "Student"}`}
        </h2>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4 text-sm font-semibold">
          {/* Name Field (Only for Register) */}
          {!isLogin && (
            <div>
              <label className="block text-gray-600 mb-1 font-bold text-xs uppercase tracking-wider">
                Full Name
              </label>
              <input
                required
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-800 font-normal placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-600 mb-1 font-bold text-xs uppercase tracking-wider">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-800 font-normal placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-gray-600 mb-1 font-bold text-xs uppercase tracking-wider">
              Password
            </label>
            <input
              required
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 text-gray-800 font-normal placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Admin Security Key (Only for Admin Registration) */}
          {!isLogin && activeRole === "admin" && (
            <div>
              <label className="block text-red-600 mb-1 font-bold text-xs uppercase tracking-wider">
                Admin Security Key
              </label>
              <input
                required
                type="password"
                placeholder="Enter admin authorization code"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full border border-red-250 rounded-xl p-2.5 text-gray-800 font-normal placeholder-gray-450 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          )}

          {/* Submit Button */}
          {isLogin ? (
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm active:scale-[0.98] transition cursor-pointer mt-6 disabled:opacity-50 uppercase tracking-wider text-xs border-none ${
                activeRole === "admin" ? "bg-red-500 hover:bg-red-650" : "bg-blue-500 hover:bg-blue-650"
              }`}
            >
              {loading ? "Loading..." : `${activeRole === "admin" ? "Admin" : "Student"} Login`}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-sm active:scale-[0.98] transition cursor-pointer mt-6 disabled:opacity-50 uppercase tracking-wider text-xs border-none ${
                activeRole === "admin" ? "bg-red-500 hover:bg-red-650" : "bg-green-500 hover:bg-green-650"
              }`}
            >
              {loading ? "Loading..." : `Register as ${activeRole === "admin" ? "Admin" : "Student"}`}
            </button>
          )}
        </form>

        {/* Toggle link */}
        <p className="text-center mt-6 text-xs text-gray-600">
          {isLogin ? "New user? " : "Already registered? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setName("");
              setAdminKey("");
              setEmail("");
              setPassword("");
            }}
            className="text-blue-500 font-bold cursor-pointer hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;