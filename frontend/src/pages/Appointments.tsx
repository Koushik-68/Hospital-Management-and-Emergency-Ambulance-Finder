// frontend/src/pages/Appointments.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Patient {
  patient_id: number;
  name: string;
}

interface Doctor {
  doctor_id: number;
  name: string;
  specialization: string;
}

interface Appointment {
  appointment_id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  remarks: string;
}

const Appointments: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    remarks: "",
    status: "Scheduled",
  });

  // Fetch data
  const fetchData = async () => {
    try {
      const [pRes, dRes, aRes] = await Promise.all([
        axios.get("http://localhost:5000/patients"),
        axios.get("http://localhost:5000/doctors"),
        axios.get("http://localhost:5000/appointments"),
      ]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
      setAppointments(aRes.data);
    } catch {
      setMessage("❌ Failed to load data from server.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.patient_id ||
      !form.doctor_id ||
      !form.appointment_date ||
      !form.appointment_time
    ) {
      setMessage("⚠️ Please fill all required fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/appointments", form);
      setMessage("✅ Appointment scheduled successfully!");
      setForm({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        remarks: "",
        status: "Scheduled",
      });
      fetchData();
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setMessage("❌ Doctor is already booked at this time.");
      } else {
        setMessage("❌ Failed to schedule appointment.");
      }
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: number) => {
    if (!window.confirm("Are you sure to delete this appointment?")) return;
    try {
      await axios.delete(`http://localhost:5000/appointments/${id}`);
      setMessage("🗑️ Appointment deleted successfully.");
      fetchData();
    } catch {
      setMessage("❌ Failed to delete appointment.");
    }
  };

  // Update status
  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/appointments/${id}/status`, {
        status: newStatus,
      });
      setMessage(`✅ Appointment marked as ${newStatus}`);
      fetchData();
    } catch {
      setMessage("❌ Failed to update status.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointments Management</h1>

      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : message.startsWith("⚠️")
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 border p-5 rounded mb-8 grid grid-cols-2 gap-4 shadow-sm"
      >
        <select
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          name="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.doctor_id} value={d.doctor_id}>
              {d.name} ({d.specialization})
            </option>
          ))}
        </select>

        <input
          type="date"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="time"
          name="appointment_time"
          value={form.appointment_time}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <textarea
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
          className="col-span-2 p-2 border rounded"
        ></textarea>

        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Schedule Appointment
        </button>
      </form>

      {/* APPOINTMENTS TABLE */}
      <h2 className="text-xl font-semibold mb-4">
        All Appointments ({appointments.length})
      </h2>

      <table className="min-w-full border divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Patient</th>
            <th className="px-4 py-2">Doctor</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.appointment_id} className="text-sm">
              <td className="border px-4 py-2">{a.appointment_id}</td>
              <td className="border px-4 py-2">{a.patient_name}</td>
              <td className="border px-4 py-2">{a.doctor_name}</td>
              <td className="border px-4 py-2">{a.appointment_date}</td>
              <td className="border px-4 py-2">{a.appointment_time}</td>
              <td className="border px-4 py-2">{a.status}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  onClick={() => updateStatus(a.appointment_id, "Completed")}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateStatus(a.appointment_id, "Cancelled")}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteAppointment(a.appointment_id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
