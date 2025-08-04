import React, { useEffect, useState } from "react";
import DashboardLayout from "@/component/layout/DashboardLayout";
import moment from "moment";
import { getApi, putApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";

function ExpenseAdminPanel() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const fetchAllExpenses = async () => {
    try {
      const res = await getApi("/api/manager/getall/expenses");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const { status, remark } = statusUpdates[id] || {};
    if (!status) return toast.error("Please select a status");

    try {
      await putApi(`/api/manager/expense/${id}/status`, { status, remark });
      toast.success("Status updated");
      fetchAllExpenses(); // Refresh list
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchAllExpenses();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          All Expense Requests
        </h1>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-sm font-semibold text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remark</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 py-3">
                      {exp.first_name} {exp.last_name}
                    </td>
                    <td className="px-4 py-3">{exp.title}</td>
                    <td className="px-4 py-3">
                      ₹{parseFloat(exp.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {moment(exp.expense_date).format("DD MMM YYYY")}
                    </td>
                    <td className="px-4 py-3">{exp.category}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border rounded px-2 py-1"
                        value={statusUpdates[exp.id]?.status || exp.status}
                        onChange={(e) =>
                          setStatusUpdates((prev) => ({
                            ...prev,
                            [exp.id]: {
                              ...prev[exp.id],
                              status: e.target.value,
                            },
                          }))
                        }
                      >
                        <option>Pending</option>
                        <option>Approved</option>
                        <option>Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Optional"
                        className="border px-2 py-1 rounded w-40"
                        value={statusUpdates[exp.id]?.remark || ""}
                        onChange={(e) =>
                          setStatusUpdates((prev) => ({
                            ...prev,
                            [exp.id]: {
                              ...prev[exp.id],
                              remark: e.target.value,
                            },
                          }))
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdate(exp.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ExpenseAdminPanel;
