import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
  iconSize: [40, 40],
});

const AmbulanceTracking = () => {
  const [ambulance, setAmbulance] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulance((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "90vh", width: "100%", padding: "20px" }}>
      <h2>🚑 Live Ambulance Tracking</h2>
      <MapContainer
        center={[ambulance.lat, ambulance.lng]}
        zoom={14}
        style={{ height: "80%", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[ambulance.lat, ambulance.lng]} icon={ambulanceIcon}>
          <Popup>
            🚑 Ambulance Location <br />
            Lat: {ambulance.lat.toFixed(4)}, Lng: {ambulance.lng.toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default AmbulanceTracking;
