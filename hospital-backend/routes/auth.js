import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();
const JWT_SECRET = "hospital_secret_key"; // change for production

// 🔹 Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO admin (username, email, password) VALUES (?, ?, ?)";

  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err)
      return res.status(500).json({ message: "User already exists or error." });
    res.json({ message: "Admin registered successfully" });
  });
});

// 🔹 Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM admin WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const admin = results[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.admin_id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token });
  });
});

export default router;
