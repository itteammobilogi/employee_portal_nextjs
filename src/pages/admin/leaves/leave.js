import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import { useEffect, useState } from "react";

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await getApi("/api/admin/getall/leaverequests");
      setLeaveRequests(res.leaveRequests || []);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (leave_id, status) => {
    try {
      const res = await postApi("/api/admin/leave/update-status", {
        leave_id,
        status,
      });

      alert(res.message);
      fetchLeaves();
    } catch (err) {
      alert(err.message || "Something went wrong while updating leave status.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaveRequests.length > 0 ? (
              leaveRequests.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Employee</p>
                    <h3 className="font-semibold text-lg text-gray-800">
                      {leave.first_name} {leave.last_name}
                    </h3>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="text-gray-700">{leave.reason}</p>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Leave Days</p>
                    <p className="text-gray-700">{leave.leave_days}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Status</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                        leave.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : leave.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  {leave.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                        onClick={() => handleUpdateStatus(leave.id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="flex-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                        onClick={() => handleUpdateStatus(leave.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center col-span-full text-gray-500">
                No leave requests found.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
