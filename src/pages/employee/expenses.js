import React, { useEffect, useState } from "react";
import EmployeeLayout from "@/component/layout/EmployeeLayout";
import { PlusIcon } from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";
import { getApi, postApi } from "@/utils/ApiurlHelper";

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expense_date: "",
    category: "",
    description: "",
  });

  const fetchExpenses = async () => {
    try {
      const res = await getApi("/api/employee/get/expense/history");
      setExpenses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async () => {
    const { title, amount, expense_date, category } = formData;
    if (!title || !amount || !expense_date || !category) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      await postApi("/api/employee/expense/create", formData);
      toast.success("Expense submitted successfully");
      setIsModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        expense_date: "",
        category: "",
        description: "",
      });
      fetchExpenses();
    } catch (err) {
      console.error("Submission error", err);
      toast.error(err.message || "Failed to submit expense");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <EmployeeLayout>
      <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-white p-4 rounded-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 ">
          <h1 className="text-2xl font-bold text-white">My Expenses</h1>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIcon size={18} />
            Request Expense
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6">
                    Loading...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No expenses submitted.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-3">{expense.title}</td>
                    <td className="px-4 py-3">
                      ₹{parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {moment(expense.expense_date).format("DD MMM YYYY")}
                    </td>
                    <td className="px-4 py-3">{expense.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          expense.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : expense.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Submit Expense</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border px-4 py-2 rounded"
              ></textarea>

              <button
                onClick={handleSubmitExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
              >
                Submit Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
}

export default ExpensesPage;
