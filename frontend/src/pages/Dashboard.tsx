// Dashboard.tsx (Dark Gradient Version)
import React, { useEffect, useState } from "react";
import axios from "axios";

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  pendingAppointments: number;
}

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({
  title,
  value,
  color,
}) => (
  <div
    className={`p-6 rounded-xl shadow-lg border-l-4 ${color}
    bg-gradient-to-br from-gray-800 via-gray-900 to-black 
    text-gray-100 transition-transform transform hover:scale-105 hover:shadow-2xl`}
  >
    <p className="text-sm font-medium text-gray-400">{title}</p>
    <p className="text-3xl font-bold mt-1 text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard/summary");
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-300">
        Loading Dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-red-400">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center text-cyan-400">
        🏥 Hospital Overview Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          color="border-cyan-500"
        />
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          color="border-emerald-500"
        />
        <StatCard
          title="Appointments Today"
          value={stats.appointmentsToday}
          color="border-amber-400"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          color="border-rose-500"
        />
      </div>

      <div className="mt-12 text-center text-gray-400 text-sm italic">
        More detailed analytics and charts coming soon...
      </div>
    </div>
  );
};

export default Dashboard;
