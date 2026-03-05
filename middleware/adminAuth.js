const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No admin token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const admin = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid admin token" });
  }
};