// routes/dashboard.js
import express from "express";
import { db } from "../db.js";

const router = express.Router();

// GET /dashboard/summary - Fetches all quick stats
router.get("/summary", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

    // 1. Total Patients
    const totalPatients = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(patient_id) AS count FROM patients",
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0].count);
        }
      );
    });

    // 2. Total Doctors
    const totalDoctors = await new Promise((resolve, reject) => {
      db.query(
        "SELECT COUNT(doctor_id) AS count FROM doctors",
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0].count);
        }
      );
    });

    // 3. Appointments Today
    const appointmentsToday = await new Promise((resolve, reject) => {
      const sql =
        "SELECT COUNT(appointment_id) AS count FROM appointments WHERE appointment_date = ?";
      db.query(sql, [today], (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    // 4. Pending Appointments (Example of another useful metric)
    const pendingAppointments = await new Promise((resolve, reject) => {
      const sql =
        "SELECT COUNT(appointment_id) AS count FROM appointments WHERE status = 'Scheduled'";
      db.query(sql, (err, result) => {
        if (err) return reject(err);
        resolve(result[0].count);
      });
    });

    res.json({
      totalPatients: totalPatients,
      totalDoctors: totalDoctors,
      appointmentsToday: appointmentsToday,
      pendingAppointments: pendingAppointments,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;
