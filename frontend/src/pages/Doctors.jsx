// 📄 src/pages/Doctors.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import LocationPickerMap from "../components/LocationPickerMap";
import "leaflet/dist/leaflet.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    contact: "",
    email: "",
    password: "",
    availability: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const API_URL = "http://localhost:5000/doctors";

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : res.data.doctors || [];
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      alert("❌ Failed to load doctors. Check your backend or API connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const updatedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setNewDoctor({ ...newDoctor, [name]: updatedValue });
  };

  const handleLocationSelect = (lat, lng) => {
    setNewDoctor({ ...newDoctor, latitude: lat, longitude: lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newDoctor.latitude === null || newDoctor.longitude === null) {
      alert("❌ Please set the doctor's location using the map picker.");
      return;
    }

    try {
      await axios.post(API_URL, newDoctor);
      alert("✅ Doctor added successfully!");
      setNewDoctor({
        name: "",
        specialization: "",
        contact: "",
        email: "",
        password: "",
        availability: "",
        latitude: null,
        longitude: null,
      });
      fetchDoctors();
      setIsMapOpen(false);
    } catch (err) {
      console.error("Error adding doctor:", err);
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to add doctor (check console for details).";
      alert(`❌ ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-10 flex items-center text-white">
          <span className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-2 rounded-xl mr-3 shadow-lg">
            👨‍⚕️
          </span>
          Doctors Management
        </h1>

        {/* Add Doctor Form */}
        <div className="bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 mb-10 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 text-indigo-300 flex items-center">
            <span className="text-purple-400 mr-2">+</span>Add New Doctor
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              value={newDoctor.name}
              onChange={handleChange}
              placeholder="Doctor Name"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
              required
            />
            <input
              type="text"
              name="specialization"
              value={newDoctor.specialization}
              onChange={handleChange}
              placeholder="Specialization"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
            />
            <input
              type="text"
              name="contact"
              value={newDoctor.contact}
              onChange={handleChange}
              placeholder="Contact"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
            />
            <input
              type="email"
              name="email"
              value={newDoctor.email}
              onChange={handleChange}
              placeholder="Email"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
              required
            />

            {/* Location Picker */}
            <div className="col-span-2 border border-gray-700 p-5 rounded-xl bg-gray-900/40">
              <label className="block text-sm font-medium text-indigo-300 mb-2">
                Doctor Location: Click map to set
              </label>
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="text"
                  value={`Lat: ${
                    newDoctor.latitude !== null
                      ? newDoctor.latitude.toFixed(6)
                      : "N/A"
                  }`}
                  readOnly
                  className="border border-gray-700 bg-gray-800 text-gray-200 p-2 rounded w-1/2 text-sm"
                />
                <input
                  type="text"
                  value={`Lon: ${
                    newDoctor.longitude !== null
                      ? newDoctor.longitude.toFixed(6)
                      : "N/A"
                  }`}
                  readOnly
                  className="border border-gray-700 bg-gray-800 text-gray-200 p-2 rounded w-1/2 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsMapOpen(!isMapOpen)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isMapOpen ? "Hide Map Picker" : "Set Location on Map"}
              </button>

              {isMapOpen && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-700">
                  <LocationPickerMap onLocationSelect={handleLocationSelect} />
                </div>
              )}
            </div>

            <input
              type="password"
              name="password"
              value={newDoctor.password}
              onChange={handleChange}
              placeholder="Password"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
              required
            />
            <input
              type="text"
              name="availability"
              value={newDoctor.availability}
              onChange={handleChange}
              placeholder="Availability (e.g. Mon-Fri 9am-5pm)"
              className="bg-gray-900/60 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-100 placeholder-gray-400"
            />

            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>Add Doctor</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Doctors Table */}
        <div className="bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-2xl p-5 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-indigo-300">
            All Doctors
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : doctors.length === 0 ? (
            <p className="text-gray-400">No doctors found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm text-gray-200">
                <thead>
                  <tr className="bg-gray-900/70 text-indigo-300">
                    <th className="border border-gray-700 p-3">ID</th>
                    <th className="border border-gray-700 p-3">Name</th>
                    <th className="border border-gray-700 p-3">Specialty</th>
                    <th className="border border-gray-700 p-3">
                      Location (Lat/Lon)
                    </th>
                    <th className="border border-gray-700 p-3">Contact</th>
                    <th className="border border-gray-700 p-3">Email</th>
                    <th className="border border-gray-700 p-3">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr
                      key={doc.doctor_id}
                      className="hover:bg-gray-700/50 transition-all duration-150"
                    >
                      <td className="border border-gray-700 p-3">
                        {doc.doctor_id}
                      </td>
                      <td className="border border-gray-700 p-3">{doc.name}</td>
                      <td className="border border-gray-700 p-3">
                        {doc.specialization}
                      </td>
                      <td className="border border-gray-700 p-3 text-xs text-gray-400">
                        {doc.latitude}, {doc.longitude}
                      </td>
                      <td className="border border-gray-700 p-3">
                        {doc.contact}
                      </td>
                      <td className="border border-gray-700 p-3">
                        {doc.email}
                      </td>
                      <td className="border border-gray-700 p-3">
                        {doc.availability}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
