"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi } from "@/utils/ApiurlHelper";
import dayjs from "dayjs";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function AdminDashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("role_id");

    if (!token || roleId !== "1") {
      router.push("/login");
      return;
    }
    getAdminKpi();
  }, []);

  const getAdminKpi = async () => {
    try {
      const data = await getApi("/api/admin/admin/dashboard");
      console.log("API response:", data);
      setKpis(data);
    } catch (err) {
      console.error("Error fetching admin KPIs", err);
    }
  };
  if (!kpis) return <div className="p-4">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={kpis.total_employees} />
        <StatCard title="Present Today" value={kpis.attendance_today} />
        <StatCard title="Absent Today" value={kpis.absent_today} />
        <StatCard title="On Leave Today" value={kpis.on_leave_today} />
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Monthly Payroll" value={`₹ ${kpis.monthly_payroll}`} />
        <StatCard title="Pending Increments" value={kpis.pending_increments} />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Recent Joiners</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul className="divide-y">
            {kpis.recent_joiners.map((emp) => (
              <li key={emp.id} className="py-2">
                {emp.first_name} {emp.last_name} -{" "}
                {dayjs(emp.date_of_joining).format("DD MMMM YYYY")}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Male", value: kpis.gender_distribution.male },
                  { name: "Female", value: kpis.gender_distribution.female },
                  { name: "Other", value: kpis.gender_distribution.other },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">
            Attendance by Department
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpis.attendance_by_department}>
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present_today" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Department Summary</h2>
        <div className="bg-white p-4 rounded shadow">
          <ul className="divide-y">
            {kpis.department_summary.map((d, idx) => (
              <li key={idx} className="py-2">
                {d.department} - {d.count} employees
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 text-center">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
