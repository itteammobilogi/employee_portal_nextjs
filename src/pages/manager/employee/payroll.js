// pages/manager/PayrollPage.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/component/layout/DashboardLayout";
import toast from "react-hot-toast";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import { motion } from "framer-motion";
import { X, BadgeDollarSign } from "lucide-react";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newSalary, setNewSalary] = useState("");
  const [reason, setReason] = useState("");

  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  const fmtMoney = (v) => `₹${num(v).toFixed(2)}`;
  const fmtMonth = (ym) => {
    if (!ym) return "—";
    const d = new Date(`${ym}-01T00:00:00Z`); // "2025-06" -> 1st of month
    return isNaN(d)
      ? ym
      : d.toLocaleString("en-GB", { month: "short", year: "numeric" });
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getApi("/api/manager/payrolls");
        setPayrolls(res.data || []);
      } catch (err) {
        console.error("Failed to load payroll data:", err);
        toast.error("Could not load payroll records");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProposeIncrement = async () => {
    if (!newSalary || !reason) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await postApi("/api/manager/salary-increment", {
        employee_id: selectedEmployee.id,
        new_salary: parseFloat(newSalary),
        reason,
      });

      toast.success(res.message || "Proposal submitted");
      setShowModal(false);
      setNewSalary("");
      setReason("");
      setSelectedEmployee(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <DashboardLayout>
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Employee Payroll Records
        </h1>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading payroll data...
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-indigo-100 text-indigo-700 text-left">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Month</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Deductions</th>
                  <th className="p-3">Net Salary</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.length > 0 ? (
                  payrolls.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="p-3">{fmtMonth(item.salary_month)}</td>
                      <td className="p-3">{fmtMoney(item.base_salary)}</td>
                      <td className="p-3">{fmtMoney(item.bonus)}</td>
                      <td className="p-3">
                        {fmtMoney(item.deduction ?? item.other_deductions)}
                      </td>
                      <td className="p-3 font-semibold text-green-700">
                        {fmtMoney(item.total_salary ?? item.net_pay)}
                      </td>
                      <td className="p-3">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => {
                            setSelectedEmployee({
                              id: item.employee_id,
                              first_name: item.first_name,
                              last_name: item.last_name,
                              base_salary: num(item.base_salary), // ensure numeric
                            });
                            setShowModal(true);
                          }}
                        >
                          Propose Increment
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-5 text-center text-gray-500">
                      No payroll records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && selectedEmployee && (
          <div className="fixed inset-0 z-50 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
            >
              {/* Close */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedEmployee(null);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <BadgeDollarSign className="text-indigo-600" /> Propose
                Increment
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                For{" "}
                <strong>
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </strong>
              </p>

              {/* 💰 Previous Salary Info */}
              <div className="text-sm text-gray-700 mb-2">
                Previous Salary:{" "}
                <strong>₹{selectedEmployee.base_salary}</strong>
              </div>

              {/* 🔢 New Salary Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Salary (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter new salary"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* 📊 Show % Increase if applicable */}
              {newSalary &&
                selectedEmployee.base_salary &&
                newSalary > selectedEmployee.base_salary && (
                  <div className="text-sm text-green-600 font-medium mb-3">
                    {`Increment: ₹${
                      newSalary - selectedEmployee.base_salary
                    } (${(
                      ((newSalary - selectedEmployee.base_salary) /
                        selectedEmployee.base_salary) *
                      100
                    ).toFixed(2)}%)`}
                  </div>
                )}

              {/* ✍️ Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Increment
                </label>
                <textarea
                  placeholder="Performance, promotion, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedEmployee(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProposeIncrement}
                  className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Submit Proposal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
