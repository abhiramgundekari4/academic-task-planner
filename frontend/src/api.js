// frontend/src/api.js

export const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5002"
  : "https://smart-task-manager-27w3.onrender.com";

export const getToken = () => localStorage.getItem("token");