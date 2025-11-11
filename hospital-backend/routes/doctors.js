import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Define the fields safe to expose to the frontend
const safeFields =
  "doctor_id, name, specialization, contact, email, availability, latitude, longitude";

// 1. ✅ Get all doctors (Safe: Password excluded)
router.get("/", (req, res) => {
  const sql = `SELECT ${safeFields} FROM doctors ORDER BY doctor_id DESC`;
  db.query(sql, (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Database error fetching doctors." });
    res.json(results);
  });
});

// 2. ✅ Add new doctor (Needs Hashing)
router.post("/", (req, res) => {
  const {
    name,
    specialization,
    contact,
    email,
    password, // ⚠️ In production, this MUST be hashed (e.g., using bcrypt)
    availability,
    latitude,
    longitude,
  } = req.body;

  // ⚠️ TEMPORARY: Assuming 'password' is used directly for now.
  // In a real app, use `const hashedPassword = hash(password);`
  const hashedPassword = password;

  const sql = `
    INSERT INTO doctors (name, specialization, contact, email, password, availability, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      specialization,
      contact,
      email,
      hashedPassword, // Use the hashed password here
      availability,
      latitude,
      longitude,
    ],
    (err, result) => {
      // Handle MySQL unique key constraint error (e.g., duplicate email)
      if (err && err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "Email already registered." });
      }
      if (err)
        return res
          .status(500)
          .json({ error: "Database error inserting new doctor." });

      res.json({
        message: "Doctor added successfully",
        doctor_id: result.insertId,
      });
    }
  );
});

// 3. ✅ Get nearby doctors by user's location (CRITICALLY FIXED)
router.get("/nearby", (req, res) => {
  const { lat, lon, radius } = req.query;
  const R = 6371; // Earth radius in km

  if (!lat || !lon)
    return res.status(400).json({ error: "Latitude and longitude required" });

  const sql = `
    SELECT ${safeFields},  -- 🛑 CRITICAL FIX: Ensure password is NOT included here
      (${R} * ACOS(
        COS(RADIANS(?)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(?)) +
        SIN(RADIANS(?)) * SIN(RADIANS(latitude))
      )) AS distance
    FROM doctors
    HAVING distance < ?
    ORDER BY distance ASC
  `;

  db.query(sql, [lat, lon, lat, radius || 10], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Database error calculating nearby doctors." });
    res.json(results);
  });
});

export default router;
