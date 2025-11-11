import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// 🌍 Haversine formula to calculate distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 🗺️ Map view updater
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) map.setView(coords, 13);
  }, [coords, map]);
  return null;
};

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [sortedDoctors, setSortedDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [radius, setRadius] = useState(5000); // default 5km
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);

  // 📍 Fix marker icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  // 🔹 Fetch doctors from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/doctors")
      .then((res) => {
        const data = res.data || [];
        setDoctors(data);
        setFilteredDoctors(data);
      })
      .catch((err) => console.error("Error fetching doctors:", err));
  }, []);

  // 🔹 Filter based on name, specialization, and radius
  useEffect(() => {
    if (!doctors.length) return;

    const lowerSearch = searchTerm.toLowerCase().trim();
    const filtered = doctors.filter((doc) => {
      const name = (doc.name || "").toLowerCase();
      const spec = (doc.specialization || "").toLowerCase();

      const withinRadius =
        getDistance(
          userLocation[0],
          userLocation[1],
          doc.latitude,
          doc.longitude
        ) <=
        radius / 1000; // convert m → km

      const matchesSearch =
        name.includes(lowerSearch) || spec.includes(lowerSearch);

      const matchesSpec =
        !specialization || spec.includes(specialization.toLowerCase());

      return withinRadius && matchesSearch && matchesSpec;
    });

    setFilteredDoctors(filtered);
  }, [searchTerm, specialization, radius, doctors, userLocation]);

  // 🔹 Sort filtered doctors by distance
  useEffect(() => {
    const sorted = filteredDoctors
      .map((doc) => ({
        ...doc,
        distance: getDistance(
          userLocation[0],
          userLocation[1],
          doc.latitude,
          doc.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    setSortedDoctors(sorted);
  }, [filteredDoctors, userLocation]);

  // 🔹 Get current user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Location access denied. Using default.")
      );
    }
  }, []);

  const handleDoctorClick = (doc) => {
    setUserLocation([doc.latitude, doc.longitude]);
  };

  // 🧭 Extract unique specializations for dropdown
  const specializations = [
    ...new Set(doctors.map((d) => d.specialization).filter(Boolean)),
  ];

  return (
    <div style={{ display: "flex", height: "90vh", width: "100%" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "320px",
          padding: "20px",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          backgroundColor: "#414A4C",
        }}
      >
        <h2>Find a Doctor</h2>

        {/* 🔍 Search by name */}
        <input
          type="text"
          placeholder="Search by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />

        {/* 🩺 Filter by specialization */}
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        >
          <option value="">All Specializations</option>
          {specializations.map((spec, i) => (
            <option key={i} value={spec}>
              {spec}
            </option>
          ))}
        </select>

        {/* 📏 Radius filter */}
        <label style={{ display: "block", marginBottom: "5px" }}>
          Radius: {(radius / 1000).toFixed(1)} km
        </label>
        <input
          type="range"
          min="1000"
          max="20000"
          step="500"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: "100%", marginBottom: "15px" }}
        />

        {/* 👩‍⚕️ Doctor List */}
        <div className="doctor-list">
          {sortedDoctors.map((doc) => (
            <div
              key={doc.doctor_id}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                backgroundColor: "white",
                marginBottom: "10px",
                borderRadius: "4px",
                boxShadow:
                  userLocation[0] === doc.latitude &&
                  userLocation[1] === doc.longitude
                    ? "0 0 5px 2px #2563eb"
                    : "none",
              }}
              onClick={() => handleDoctorClick(doc)}
            >
              <strong>{doc.name}</strong>
              <span
                style={{
                  float: "right",
                  fontWeight: "bold",
                  color: "#10b981",
                }}
              >
                {doc.distance ? `${doc.distance.toFixed(1)} km` : ""}
              </span>
              <p style={{ margin: "0", fontSize: "14px", color: "#555" }}>
                {doc.specialization}
              </p>
            </div>
          ))}
          {sortedDoctors.length === 0 && (
            <p style={{ color: "#888" }}>No doctors found.</p>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <ChangeMapView coords={userLocation} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>
              {userLocation[0] === 12.9716
                ? "Default Location (Bangalore) 🏠"
                : "Your Location 📍"}
            </Popup>
          </Marker>
          <Circle
            center={userLocation}
            radius={radius}
            pathOptions={{
              color: "blue",
              fillColor: "#9ecfff",
              fillOpacity: 0.3,
            }}
          />
          {sortedDoctors.map((doc) => (
            <Marker
              key={doc.doctor_id}
              position={[doc.latitude, doc.longitude]}
            >
              <Popup>
                <strong>{doc.name}</strong>
                <br />
                {doc.specialization}
                <br />
                <small style={{ color: "#10b981" }}>
                  {doc.distance.toFixed(1)} km away
                </small>
                <br />
                📞 {doc.contact}
                <br />
                <button
                  style={{
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    marginTop: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => alert(`Booking appointment with ${doc.name}`)}
                >
                  Book Now
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default FindDoctors;
