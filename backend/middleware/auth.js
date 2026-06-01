const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  console.log("HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ msg: "No token ❌" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded.user;

    console.log("DECODED:", decoded);

    next();
  } catch (err) {
    console.log("❌ JWT ERROR:", err.message);
    res.status(401).json({ msg: "Invalid token ❌" });
  }
};