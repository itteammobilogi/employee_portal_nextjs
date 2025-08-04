import React, { useEffect, useState } from "react";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi } from "@/utils/ApiurlHelper";
import { useRouter } from "next/router";
import { saveAs } from "file-saver";

const formatDate = (isoString) => {
  if (!isoString) return "—";
  const formatted = new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  // 👇 Force Excel to treat as text (preserve AM/PM)
  return `"${formatted}"`;
};

const exportToCSV = (data, monthVal, yearVal) => {
  const headers = [
    "Employee Name",
    "Email",
    "Clock In",
    "Clock Out",
    "Latitude",
    "Longitude",
    "Location Type",
    "Status",
  ];

  const rows = data.map((row) => [
    row.employee_name,
    row.email,
    formatDate(row.clock_in),
    formatDate(row.clock_out),
    row.latitude,
    row.longitude,
    row.location_type,
    row.status || (row.clock_in ? "Present" : "Absent"),
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `attendance_${monthVal || "all"}_${yearVal || "all"}.csv`);
};

function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemperPage = 5;

  const totalPages = Math.ceil(attendanceData.length / itemperPage);
  const paginatedData = attendanceData.slice(
    (currentPage - 1) * itemperPage,
    currentPage * itemperPage
  );
  const router = useRouter();

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (month) query.append("month", month);
      if (year) query.append("year", year);

      const res = await getApi(
        `/api/admin/getall/attendence?${query.toString()}`
      );
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search, month, year]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Employee Attendance</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-end">
          <input
            type="text"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full sm:w-64"
          />

          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border px-3 py-2 rounded-md"
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={fetchAttendance}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Apply Filters
          </button>

          <button
            onClick={() => exportToCSV(attendanceData, month, year)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Export CSV
          </button>
        </div>

        {loading ? (
          <p>Loading attendance data...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-700 bg-white">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-5 text-left">#</th>
                  <th className="py-3 px-5 text-left">Employee</th>
                  <th className="py-3 px-5 text-left">Email</th>
                  <th className="py-3 px-5 text-left">Clock In</th>
                  <th className="py-3 px-5 text-left">Clock Out</th>
                  <th className="py-3 px-5 text-left">Photo In</th>
                  <th className="py-3 px-5 text-left">Photo Out</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) => (
                  <tr
                    key={item.attendance_id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-50 transition-all duration-200`}
                    onClick={() =>
                      router.push(
                        `/admin/attendance/employee/${item.employee_id}`
                      )
                    }
                  >
                    <td className="py-3 px-5 font-medium">{idx + 1}</td>
                    <td className="py-3 px-5 flex items-center gap-3">
                      <img
                        src={item.profile_photo || "/default-user.png"}
                        alt="profile"
                        className="w-9 h-9 rounded-full shadow-md object-cover"
                      />
                      <span className="font-semibold">
                        {item.employee_name}
                      </span>
                    </td>
                    <td className="py-3 px-5">{item.email}</td>
                    <td className="py-3 px-5">{item.clock_in}</td>
                    <td className="py-3 px-5">{item.clock_out || "—"}</td>
                    <td className="py-3 px-5">
                      {item.photo_in ? (
                        <>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {item.photo_in.slice(0, 30)}...
                          </div>
                          <img
                            src={
                              item.photo_in.startsWith("data:image/")
                                ? item.photo_in
                                : `data:image/jpeg;base64,${item.photo_in}`
                            }
                            alt="In"
                            className="w-12 h-12 border bg-white object-cover mt-2"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-5">
                      {item.photo_out ? (
                        <>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {item.photo_out.slice(0, 30)}...
                          </div>
                          <img
                            src={
                              item.photo_out.startsWith("data:image/")
                                ? item.photo_out
                                : `data:image/jpeg;base64,${item.photo_out}`
                            }
                            alt="In"
                            className="w-12 h-12 border bg-white object-cover mt-2"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end items-center gap-2 p-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Attendance;
