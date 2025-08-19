import React, { useEffect, useState } from "react";
import EmployeeLayout from "@/component/layout/EmployeeLayout";
import { getAttendanceApi } from "@/utils/ApiurlHelper";
import {
  RefreshCw,
  FileDown,
  LogIn,
  LogOut,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";

/** ===== Mini helpers ===== */
const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

// API sends worked_hours as string hours like "0.00". Show as HH:MM.
const workedToHHMM = (worked_hours) => {
  if (worked_hours == null || worked_hours === "") return "—";
  const hours = Number(worked_hours);
  if (!Number.isFinite(hours)) return "—";
  const mins = Math.round(hours * 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// CSV export (simple)
const exportCSV = (rows, filename) => {
  if (!rows?.length) return;
  const cols = [
    "id",
    "employee_id",
    "status",
    "clock_in",
    "clock_out",
    "worked_hours",
    "latitude",
    "longitude",
    "location_type",
  ];
  const head = cols.join(",");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const val = (r?.[c] ?? "").toString().replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([head + "\n" + body], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** ===== Minimal, stable page ===== */
export default function AttendancePage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      // Basic endpoint, no query params. Your sample payload matches this.
      const res = await getAttendanceApi("api/employee/attendance");
      if (!res?.success) throw new Error("Request failed");
      const data = Array.isArray(res.data) ? res.data : [];
      setRows(data);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExport = () => exportCSV(rows, "attendance.csv");

  return (
    <EmployeeLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 mb-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              My Attendance
            </h1>
            <p className="text-sm text-gray-500">
              Simple view of your last records.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              <FileDown size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Table */}
        <div className="mt-6 rounded-2xl border overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 text-sm text-gray-600">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={16} className="animate-spin" /> Loading…
              </span>
            ) : (
              <span>{rows?.length || 0} records</span>
            )}
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white shadow-[0_1px_0_#eee]">
                <tr className="text-left">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Clock In</th>
                  <th className="px-4 py-3">Clock Out</th>
                  <th className="px-4 py-3">Worked (HH:MM)</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Photos</th>
                </tr>
              </thead>
              <tbody>
                {!loading && (!rows || rows.length === 0) && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}

                {(rows || []).map((r) => {
                  const status = r?.status ?? r?.attendance_status ?? "—";
                  const loc =
                    r?.latitude && r?.longitude
                      ? `${r.latitude}, ${r.longitude}${
                          r?.location_type ? ` (${r.location_type})` : ""
                        }`
                      : r?.location_in || "—";
                  return (
                    <tr
                      key={r?.id ?? `${r?.clock_in}-${r?.employee_id}`}
                      className="border-t hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3">
                        {status !== "—" ? (
                          <span className="inline-flex text-xs rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
                            {status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <LogIn size={16} className="opacity-70" />
                          {fmtDateTime(r?.clock_in)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <LogOut
                            size={16}
                            className={
                              r?.clock_out ? "opacity-70" : "opacity-30"
                            }
                          />
                          {fmtDateTime(r?.clock_out)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {workedToHHMM(r?.worked_hours)}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap max-w-[260px] truncate"
                        title={loc}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} /> {loc}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} />
                          <div className="flex gap-2">
                            {r?.photo_in ? (
                              <img
                                src={r.photo_in}
                                alt="in"
                                className="h-8 w-8 rounded object-cover border"
                              />
                            ) : (
                              <span className="text-xs text-gray-500">—</span>
                            )}
                            {r?.photo_out ? (
                              <img
                                src={r.photo_out}
                                alt="out"
                                className="h-8 w-8 rounded object-cover border"
                              />
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tiny legend */}
        {/* <div className="mt-4 text-xs text-gray-500">
          Times are shown in your browser’s local timezone.
        </div> */}
      </div>
    </EmployeeLayout>
  );
}
