import express from "express";
import { db } from "../db.js";

const router = express.Router();

// ✅ Get all appointments
router.get("/", (req, res) => {
  const sql = `
    SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.remarks,
           p.name AS patient_name, d.name AS doctor_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
    ORDER BY a.appointment_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Add new appointment
router.post("/", (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, remarks } =
    req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, remarks)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [patient_id, doctor_id, appointment_date, appointment_time, remarks],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({
        message: "Appointment added successfully",
        id: result.insertId,
      });
    }
  );
});

// ✅ Update appointment status (Complete / Cancelled)
router.put("/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE appointments SET status = ? WHERE appointment_id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment status updated successfully" });
  });
});

// ✅ Delete appointment
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM appointments WHERE appointment_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  });
});

export default router;
