import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./styles/main.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Dashboard from "./pages/Dashboard";
import FindDoctor from "./pages/FindDoctors";
import AmbulanceTracking from "./pages/AmbulanceTracking";
import Emergency from "./pages/Emergency";
import Sidebar from "./components/Sidebar";

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const isLoggedIn = localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex", minHeight: "100vh" }}>
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/findDoctors" element={<FindDoctor />} />
                    <Route path="/Emergency" element={<Emergency />} />
                    <Route
                      path="/AmbulanceTracking"
                      element={<AmbulanceTracking />}
                    />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
