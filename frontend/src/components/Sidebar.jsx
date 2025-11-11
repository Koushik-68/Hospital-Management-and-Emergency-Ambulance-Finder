import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdPersonAdd,
  MdMedicalServices,
  MdCalendarToday,
  MdSearch,
  MdLogout,
  MdEmergency,
} from "react-icons/md";
import { FaHospitalSymbol } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: <MdDashboard />, label: "Dashboard" },
    { path: "/patients", icon: <MdPersonAdd />, label: "Patients" },
    { path: "/doctors", icon: <MdMedicalServices />, label: "Doctors" },
    { path: "/appointments", icon: <MdCalendarToday />, label: "Appointments" },
    { path: "/findDoctors", icon: <MdSearch />, label: "Find Doctors" },
    { path: "/Emergency", icon: <MdEmergency />, label: "Emergency" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <FaHospitalSymbol className="hospital-icon" />
        <h2>Hospital</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
