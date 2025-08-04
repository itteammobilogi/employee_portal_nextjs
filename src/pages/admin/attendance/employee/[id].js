"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi } from "@/utils/ApiurlHelper";
import Link from "next/link";
import dayjs from "dayjs";
import { CSVLink } from "react-csv";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";

const EmployeeAttendancePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const now = new Date();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getApi(
          `/api/admin/employee/${id}?month=${month}&year=${year}`
        );
        setEmployee(res.employee);
        setAttendance(res.attendance);
        setSummary(res.summary);
      } catch (error) {
        console.error("Error fetching employee attendance", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, month, year]);

  const totalDays = summary?.totalDays || 0;
  const presentDays = summary?.present || 0;
  const leaveDays = summary?.leave || 0;

  const csvData = useMemo(() => {
    return attendance.map((a, idx) => ({
      "#": idx + 1,
      Date: a.clock_in ? dayjs(a.clock_in).format("DD MMM YYYY") : "—",
      "Clock In": a.clock_in ? dayjs(a.clock_in).format("hh:mm A") : "—",
      "Clock Out": a.clock_out ? dayjs(a.clock_out).format("hh:mm A") : "—",
      Location: a.location_type || "—",
      "Photo In?": a.photo_in ? "Yes" : "—",
      "Photo Out?": a.photo_out ? "Yes" : "—",
      Status: a.clock_in ? "Present" : "Leave",
    }));
  }, [attendance]);

  if (loading)
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );

  if (!employee)
    return (
      <DashboardLayout>
        <div className="p-6">Employee not found</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Back Button */}
        <div>
          <Link href="/admin/attendance">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              ← Back to Attendance List
            </button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-gray-800">
            {employee.first_name} {employee.last_name}
          </h2>
          <p className="text-gray-500">{employee.email}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white shadow rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
              <CalendarDays size={20} />
              <span>Total Days</span>
            </div>
            <p className="text-2xl font-bold">{totalDays}</p>
          </div>

          <div className="bg-green-50 shadow rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
              <CheckCircle size={20} />
              <span>Present</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{presentDays}</p>
          </div>

          <div className="bg-red-50 shadow rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
              <XCircle size={20} />
              <span>Leave</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {leaveDays < 0 ? 0 : leaveDays}
            </p>
          </div>
        </div>

        {/* Month/Year Filters + Export */}
        <div className="flex flex-wrap items-center gap-4 justify-between mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Month:
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {dayjs().month(i).format("MMMM")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {attendance.length > 0 && (
            <CSVLink
              data={csvData}
              filename={`Attendance_${employee?.first_name}_${summary?.month}_${summary?.year}.csv`}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              📤 Export CSV
            </CSVLink>
          )}
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg mt-2">
          <table className="min-w-full bg-white text-sm text-gray-800">
            <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  #
                </th>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  Clock In
                </th>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  Clock Out
                </th>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  Location
                </th>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  Photo In
                </th>
                <th className="py-4 px-6 text-left font-semibold tracking-wide">
                  Photo Out
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => (
                <tr
                  key={a.id}
                  className={`transition duration-150 ease-in-out ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-indigo-50`}
                >
                  <td className="py-3 px-6 font-medium">{idx + 1}</td>
                  <td className="py-3 px-6">
                    {a.clock_in
                      ? dayjs(a.clock_in).format("DD MMM YYYY • hh:mm A")
                      : "—"}
                  </td>
                  <td className="py-3 px-6">
                    {a.clock_out
                      ? dayjs(a.clock_out).format("DD MMM YYYY • hh:mm A")
                      : "—"}
                  </td>
                  <td className="py-3 px-6">{a.location_type || "—"}</td>
                  <td className="py-3 px-6">
                    {a.photo_in ? (
                      <img
                        src={a.photo_in}
                        alt="Photo In"
                        className="w-14 h-14 object-cover rounded-md border shadow-sm"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {a.photo_out ? (
                      <img
                        src={a.photo_out}
                        alt="Photo Out"
                        className="w-14 h-14 object-cover rounded-md border shadow-sm"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeAttendancePage;
