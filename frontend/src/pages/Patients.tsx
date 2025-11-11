import React, { useEffect, useState } from "react";
import axios from "axios";

// 1. UPDATED: Patient interface to match the backend SELECT query
interface Patient {
  patient_id: number;
  name: string;
  gender: "Male" | "Female" | "Other"; // Better type for ENUM
  dob: string; // DATE is usually returned as a string in JS
  contact: string; // Changed from 'phone' to 'contact'
  email: string; // Added 'email'
  address: string;
  // Note: 'password' is omitted as it shouldn't be fetched or displayed
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  // 2. UPDATED: form state to match all required/used backend fields
  const [form, setForm] = useState({
    name: "",
    gender: "", // Must be 'Male', 'Female', or 'Other'
    dob: "", // Changed from 'age' to 'dob' (Date of Birth)
    contact: "", // Changed from 'phone' to 'contact'
    email: "", // Added 'email'
    password: "", // Added 'password'
    address: "",
  });

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The 'form' object now contains all fields the backend expects:
      // name, gender, dob, contact, email, password, address
      await axios.post("http://localhost:5000/patients", form);

      // Clear form and re-fetch patients
      setForm({
        name: "",
        gender: "",
        dob: "",
        contact: "",
        email: "",
        password: "",
        address: "",
      });
      fetchPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Failed to add patient. Check console for details.");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        {/* Changed to a select for the ENUM type for better validation */}
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date" // 3. UPDATED: Input type for Date of Birth
          placeholder="Date of Birth"
          value={form.dob}
          onChange={(e) => setForm({ ...form, dob: e.target.value })}
          required
        />
        <input
          placeholder="Contact (Phone)" // 4. UPDATED: Placeholder and key
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          required
        />
        <input
          type="email" // 5. ADDED: Email input field
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password" // 6. ADDED: Password input field
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        <button type="submit">Add Patient</button>
      </form>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>DOB</th> {/* 7. UPDATED: Header for DOB */}
            <th>Contact</th> {/* 8. UPDATED: Header for Contact */}
            <th>Email</th> {/* 9. ADDED: Header for Email */}
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.patient_id}>
              <td>{p.patient_id}</td>
              <td>{p.name}</td>
              <td>{p.gender}</td>
              <td>{p.dob}</td> {/* 10. UPDATED: Display DOB */}
              <td>{p.contact}</td> {/* 11. UPDATED: Display Contact */}
              <td>{p.email}</td> {/* 12. ADDED: Display Email */}
              <td>{p.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;
