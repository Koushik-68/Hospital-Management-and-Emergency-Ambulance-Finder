import express from "express";
import { db } from "../db.js";

const router = express.Router();

// ✅ Get all patients
router.get("/", (req, res) => {
  const sql =
    "SELECT patient_id, name, gender, dob, contact, email, address FROM patients ORDER BY patient_id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Add new patient
router.post("/", (req, res) => {
  const { name, gender, dob, contact, email, password, address } = req.body;
  const sql =
    "INSERT INTO patients (name, gender, dob, contact, email, password, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, gender, dob, contact, email, password, address],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({
        message: "Patient added successfully",
        patient_id: result.insertId,
      });
    }
  );
});

export default router;
