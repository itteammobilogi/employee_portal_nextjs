"use client";
import React, { useEffect, useState } from "react";
import { CalendarCheck2, FileText, PlusCircle } from "lucide-react";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import EmployeeLayout from "@/component/layout/EmployeeLayout";

const Leaves = () => {
  const [summary, setSummary] = useState(null);
  const [leaveDays, setLeaveDays] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const perPage = 5;

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await getApi("/api/employee/my/leaves");
      setSummary(data);
    } catch (error) {
      console.error("Error fetching leave summary:", error);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveDays || !reason || !startDate || !endDate) {
      alert("Please fill in all fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    try {
      setLoading(true);
      await postApi("/api/employee/leave", {
        leave_days: parseFloat(leaveDays),
        reason,
        start_date: startDate,
        end_date: endDate,
      });
      setMsg("Leave applied successfully!");
      setLeaveDays("");
      setReason("");
      setStartDate("");
      setEndDate("");
      setPage(1); // Reset pagination
      fetchSummary(); // Refresh summary
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil((summary?.history?.length || 0) / perPage);
  const paginatedHistory = summary?.history?.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <EmployeeLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-10 bg-gradient-to-br from-gray via-white-900 to-black p-4 rounded-xl">
        {/* Leave Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              label: "Total Leave",
              value: summary?.balance_leave || 0,
              color: "bg-green-500/10 text-green-600",
            },
            {
              label: "Used Leave",
              value: summary?.used_leave || 0,
              color: "bg-yellow-400/10 text-yellow-600",
            },
            {
              label: "Balance",
              value: summary?.balance_leave || 0,
              color: "bg-blue-500/10 text-blue-600",
            },
          ].map((item, i) => (
            <div key={i} className={`rounded-xl p-5 ${item.color} shadow-md`}>
              <p className="text-sm font-medium">{item.label}</p>
              <h3 className="text-4xl font-extrabold mt-2">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* Apply Leave Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            Apply for Leave
          </h2>

          {msg && <div className="text-green-600 mb-3 font-medium">{msg}</div>}

          <form
            onSubmit={handleApplyLeave}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Days
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="2.5"
                placeholder="e.g. 1.5"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={leaveDays}
                onChange={(e) => setLeaveDays(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                rows={4}
                placeholder="Explain your reason..."
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
              >
                {loading ? "Submitting..." : "Apply Leave"}
              </button>
            </div>
          </form>
        </div>

        {/* Leave History Table */}
        {/* Leave History Table */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-gray-700" />
            Leave History
          </h2>

          {summary?.history?.length ? (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <div className="min-w-[800px] divide-y divide-gray-200">
                  {/* Header */}
                  <div className="grid grid-cols-6 text-sm font-semibold bg-gray-50 px-4 py-3">
                    <div>Applied On</div>
                    <div>Start Date</div>
                    <div>End Date</div>
                    <div>Days</div>
                    <div>Reason</div>
                    <div>Status</div>
                  </div>

                  {/* Rows */}
                  {paginatedHistory.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-6 items-center text-sm text-gray-800 px-4 py-4 border-b hover:bg-gray-50"
                    >
                      <div>
                        {new Date(item.created_at).toLocaleDateString("en-IN")}
                      </div>
                      <div>
                        {new Date(item.start_date).toLocaleDateString("en-IN")}
                      </div>
                      <div>
                        {new Date(item.end_date).toLocaleDateString("en-IN")}
                      </div>
                      <div>{item.leave_days}</div>
                      <div className="truncate sm:whitespace-normal">
                        {item.reason}
                      </div>
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {summary.history.length > perPage && (
                <div className="flex justify-center items-center mt-4 gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No leave history available.
            </p>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Leaves;
