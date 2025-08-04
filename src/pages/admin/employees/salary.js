import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function SalaryIncrementPage() {
  const [increments, setIncrements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncrements = async () => {
    try {
      const res = await getApi("/api/admin/employee/salary/all");
      setIncrements(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch increment data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const confirm = window.confirm(`Are you sure to ${status} this increment?`);
    if (!confirm) return;

    try {
      const res = await postApi("/api/admin/salary-increment/status", {
        increment_id: id,
        status,
      });
      toast.success(res.message);
      fetchIncrements();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  useEffect(() => {
    fetchIncrements();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Salary Increment Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white rounded-lg shadow-md">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 border-b">Employee</th>
                  <th className="text-left px-4 py-3 border-b">
                    Current Salary
                  </th>
                  <th className="text-left px-4 py-3 border-b">
                    Proposed Salary
                  </th>
                  <th className="text-left px-4 py-3 border-b">Reason</th>
                  <th className="text-left px-4 py-3 border-b">Status</th>
                  <th className="text-left px-4 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {increments.length > 0 ? (
                  increments.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 border-b">
                        <div className="font-semibold">
                          {inc.first_name} {inc.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{inc.employee_id}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-700">
                        ₹{inc.previous_salary}
                      </td>
                      <td className="px-4 py-3 border-b text-blue-700 font-semibold">
                        ₹{inc.new_salary}
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">
                        {inc.reason}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            inc.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : inc.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {inc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b">
                        {inc.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateStatus(inc.id, "Approved")
                              }
                              className="px-3 cursor-pointer py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(inc.id, "Rejected")
                              }
                              className="px-3 py-1 cursor-pointer bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No increment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SalaryIncrementPage;
