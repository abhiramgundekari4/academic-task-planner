const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();


// 🔥 CORS (Frontend allow cheyadaniki)
app.use(cors({
  origin: "*",  // later Vercel URL pettochu
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// 🔥 BODY PARSER
app.use(express.json());


// 🔹 ROUTES IMPORT
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const profileRoutes = require("./routes/profile");
const facultyRoutes = require("./routes/faculty");


// 🔹 ROUTES USE
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);  // 🔥 MUST
app.use("/api/faculty", facultyRoutes);


// 🔹 ROOT TEST
app.get("/", async (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: "disconnected ❌",
    1: "connected ✅",
    2: "connecting ⏳",
    3: "disconnecting 🔌"
  };
  
  let dbUsers = [];
  try {
    const User = require("./models/User");
    dbUsers = await User.find({}, "name email role");
  } catch (e) {
    dbUsers = ["Error fetching users: " + e.message];
  }

  res.json({
    status: "API Running 🚀",
    database: states[status] || "unknown",
    dbName: mongoose.connection.name,
    dbHost: mongoose.connection.host,
    users: dbUsers
  });
});


// 🔹 DB CONNECT (better logging)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ DB ERROR:", err.message);
    process.exit(1);
  });


// 🔹 SERVER START
const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});