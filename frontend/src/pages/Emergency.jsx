import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// === ICONS ===
// Ambulance Icon (Red/White)
const ambulanceIcon = new L.Icon({
  // A different ambulance icon (side view)
  iconUrl:
    "https://imgs.search.brave.com/nGkPmB6ICXyfE4Wn_kvjpeCQqjvtvx5fhmr5LSKqQxQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/aWNvbnNjb3V0LmNv/bS9pY29uL2ZyZWUv/cG5nLTI1Ni9mcmVl/LWFtYnVsYW5jZS1p/Y29uLWRvd25sb2Fk/LWluLXN2Zy1wbmct/Z2lmLWZpbGUtZm9y/bWF0cy0tZW1lcmdl/bmN5LW1lZGljYWwt/dmVoaWNsZS1ob3Nw/aXRhbC1kaXNlYXNl/LXBhY2staGVhbHRo/Y2FyZS1pY29ucy0x/OTg4MTIwLnBuZz9m/PXdlYnAmdz0xMjg",
  iconSize: [40, 40],
});

// Hospital Icon (Green Cross)
const hospitalIcon = new L.Icon({
  // A common 'H' symbol for hospitals
  iconUrl:
    "https://imgs.search.brave.com/dPTURf43CT8s2_tosNUhP2kgvXUz3BtOaLDLY6LtbiU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZs/YXRpY29uLmNvbS8x/MjgvODE0NS84MTQ1/NzIxLnBuZw",
  iconSize: [38, 38],
});

// === Haversine formula (distance in km) ===
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

// === Map updater ===
const ChangeMapView = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 14);
  }, [coords, map]);
  return null;
};

const Emergency = () => {
  // TypeScript generics <[number, number]> and <any[]> have been removed
  const [userLocation, setUserLocation] = useState([12.9716, 77.5946]);
  const [radius] = useState(6000);
  const [hospitals, setHospitals] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [logs, setLogs] = useState([]);
  const [route, setRoute] = useState([]);

  // === Get current user location ===
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.warn("Using default location.")
      );
    }
  }, []);

  // === Dummy hospital data ===
  useEffect(() => {
    const hospitalData = [
      {
        id: 1,
        name: "Apollo Hospital",
        lat: 12.975,
        lng: 77.601,
        beds: 8,
        open: true,
      },
      {
        id: 2,
        name: "Fortis Hospital",
        lat: 12.965,
        lng: 77.582,
        beds: 2,
        open: true,
      },
      {
        id: 3,
        name: "Manipal Hospital",
        lat: 12.978,
        lng: 77.59,
        beds: 0,
        open: false,
      },
    ];
    setHospitals(hospitalData);
  }, []);

  // === Simulate ambulances moving ===
  useEffect(() => {
    const ambData = [
      {
        id: 1,
        name: "Ambulance A",
        lat: 12.97,
        lng: 77.59,
        status: "Available",
      },
      { id: 2, name: "Ambulance B", lat: 12.969, lng: 77.6, status: "Busy" },
      {
        id: 3,
        name: "Ambulance C",
        lat: 12.974,
        lng: 77.58,
        status: "Available",
      },
    ];
    setAmbulances(ambData);

    const interval = setInterval(() => {
      setAmbulances((prev) =>
        prev.map((a) => ({
          ...a,
          lat: a.lat + (Math.random() - 0.5) * 0.001,
          lng: a.lng + (Math.random() - 0.5) * 0.001,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // === Find nearest hospital ===
  useEffect(() => {
    if (hospitals.length) {
      const nearest = hospitals.reduce((prev, curr) => {
        const d1 = getDistance(
          userLocation[0],
          userLocation[1],
          prev.lat,
          prev.lng
        );
        const d2 = getDistance(
          userLocation[0],
          userLocation[1],
          curr.lat,
          curr.lng
        );
        return d1 < d2 ? prev : curr;
      });
      setNearestHospital(nearest);
    }
  }, [hospitals, userLocation]);

  // === Emergency button ===
  const handleEmergency = () => {
    const availableAmb = ambulances.find((a) => a.status === "Available");
    if (!availableAmb) {
      alert("🚨 No ambulances available right now!");
      return;
    }

    const distance = getDistance(
      userLocation[0],
      userLocation[1],
      availableAmb.lat,
      availableAmb.lng
    ).toFixed(2);

    const logMsg = `🚑 ${availableAmb.name} dispatched from ${distance} km away!`;
    setLogs((prev) => [logMsg, ...prev]);
    availableAmb.status = "En Route";

    const speech = new SpeechSynthesisUtterance(logMsg);
    window.speechSynthesis.speak(speech);

    // draw route (simulated)
    setRoute([
      userLocation,
      [availableAmb.lat, availableAmb.lng],
      nearestHospital
        ? [nearestHospital.lat, nearestHospital.lng]
        : userLocation,
    ]);
  };

  return (
    <div style={{ display: "flex", height: "90vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "340px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <h2>🚨 Emergency Response Center</h2>
        <button
          onClick={handleEmergency}
          style={{
            background: "red",
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "15px",
            cursor: "pointer",
          }}
        >
          🚨 Call Emergency Help
        </button>

        <h3>🏥 Nearest Hospital</h3>
        {nearestHospital ? (
          <div
            style={{
              background: "#f8fafc",
              color: "black",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            <strong>{nearestHospital.name}</strong>
            <p>
              Beds: {nearestHospital.beds} |{" "}
              {nearestHospital.open ? "Open ✅" : "Closed ❌"}
            </p>
            <p>
              Distance:{" "}
              {getDistance(
                userLocation[0],
                userLocation[1],
                nearestHospital.lat,
                nearestHospital.lng
              ).toFixed(2)}{" "}
              km
            </p>
          </div>
        ) : (
          <p>Finding nearest hospital...</p>
        )}

        <h3>🚑 Active Ambulances</h3>
        {ambulances.map((a) => (
          <div
            key={a.id}
            style={{
              background: a.status === "Available" ? "#22c55e" : "#f59e0b",
              color: "white",
              padding: "8px",
              borderRadius: "6px",
              marginBottom: "6px",
            }}
          >
            {a.name} — {a.status}
          </div>
        ))}

        <h3>📋 Incident Log</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {logs.map((log, i) => (
            <li
              key={i}
              style={{
                background: "#334155",
                marginBottom: "5px",
                padding: "8px",
                borderRadius: "6px",
              }}
            >
              {log}
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <ChangeMapView coords={userLocation} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />

          {/* User location */}
          <Marker position={userLocation}>
            <Popup>Your Location 📍</Popup>
          </Marker>
          <Circle
            center={userLocation}
            radius={radius}
            pathOptions={{
              color: "red",
              fillColor: "#ffaaaa",
              fillOpacity: 0.2,
            }}
          />

          {/* Hospitals */}
          {hospitals.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
              <Popup>
                🏥 <b>{h.name}</b>
                <br />
                Beds: {h.beds}
                <br />
                Status: {h.open ? "Open ✅" : "Closed ❌"}
              </Popup>
            </Marker>
          ))}

          {/* Ambulances */}
          {ambulances.map((a) => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={ambulanceIcon}>
              <Popup>
                {a.name} — {a.status}
              </Popup>
            </Marker>
          ))}

          {/* Route */}
          {route.length > 1 && <Polyline positions={route} color="blue" />}
        </MapContainer>
      </div>
    </div>
  );
};

export default Emergency;
