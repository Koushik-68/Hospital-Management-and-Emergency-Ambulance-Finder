import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { db } from "./db.js";

import patientRoutes from "./routes/patient.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import dashboardRoutes from "./routes/dashboard.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hospital Management API is running 🚀");
});

// Routes
app.use("/auth", authRoutes);
app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});
