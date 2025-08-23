import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, leaveputApi, putApi } from "@/utils/ApiurlHelper";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

function leave() {
  const [leaves, setLeaves] = useState([]);
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const perPage = 5;

  // Fetch leave requests
  useEffect(() => {
    (async () => {
      try {
        const res = await getApi("/api/manager/leave/requests");

        if (res?.leaveRequests) {
          setLeaves(res.leaveRequests);
        } else {
          setLeaves([]);
          toast.error("No leave data received");
          console.warn("Unexpected response:", res);
        }
      } catch (err) {
        console.error("Failed to load leaves:", err);
        toast.error("Could not load leave requests");
      }
    })();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getApi("/api/manager/leave/requests");
      if (res?.leaveRequests) {
        setLeaves(res.leaveRequests);
      } else {
        setLeaves([]);
      }
    } catch (err) {
      console.error("Failed to reload leaves:", err);
    }
  };

  const updateLeaveStatus = async (leaveId, status, reason = "") => {
    try {
      setLoadingId(leaveId);
      const res = await leaveputApi(`/api/manager/leave/${leaveId}`, {
        status,
        reason,
      });

      toast.success(res.message);

      // 🔥 Re-fetch fresh data from API
      await fetchLeaves();
    } catch (err) {
      console.error("Update Leave Error:", err);
      toast.error(err.message || "Action failed, please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const totalPages = Math.ceil(leaves.length / perPage);
  const slice = leaves.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <DashboardLayout>
        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-4">
            Employee Leave Requests
          </h1>

          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-purple-100 text-purple-700 text-left">
                <tr>
                  <th className="p-2">Employee</th>
                  <th className="p-2">Days</th>
                  <th className="p-2">Start Date</th>
                  <th className="p-2">End Date</th>
                  <th className="p-2">Reason</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Applied On</th>
                  <th className="p-2">Leave Balance</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slice.length > 0 ? (
                  slice.map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-2">
                        {l.first_name} {l.last_name}
                      </td>
                      <td className="p-2">{l.leave_days}</td>
                      <td className="p-2">{l.start_date}</td>
                      <td className="p-2">{l.end_date}</td>
                      <td className="p-2">{l.reason}</td>
                      <td className="p-2">{l.status}</td>
                      <td className="p-2">{l.applied_on}</td>
                      <td className="p-2">{l.balance_leave ?? "—"}</td>
                      <td className="p-2 space-x-2">
                        {l.status === "Pending" ? (
                          <>
                            <button
                              onClick={() =>
                                updateLeaveStatus(l.id, "Approved")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1.5 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeaveId(l.id);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-1.5 rounded-md ml-2"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`font-semibold px-3 py-1.5 inline-block rounded-md ${
                              l.status === "Approved"
                                ? "text-green-600 bg-green-100"
                                : "text-red-600 bg-red-100"
                            }`}
                          >
                            {l.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Previous
              </button>
              <span className="self-center">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            </div>
          )}
        </main>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">
                Reject Leave Request
              </h2>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full border border-gray-300 p-3 rounded-md mb-4"
                rows={4}
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setSelectedLeaveId(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!rejectionReason.trim()) {
                      toast.error("Please enter a rejection reason.");
                      return;
                    }

                    try {
                      await updateLeaveStatus(
                        selectedLeaveId,
                        "Rejected",
                        rejectionReason
                      );
                      setShowRejectModal(false);
                      setRejectionReason("");
                      setSelectedLeaveId(null);
                      fetchLeaveData?.();
                    } catch (err) {
                      // toast.error("Failed to reject leave");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </div>
  );
}

export default leave;
