import { getApi, postApi, putApi } from "@/utils/ApiurlHelper";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddEditPayrollModal = ({ isOpen, onClose, onSuccess, editingData }) => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await getApi("/api/finance/getall/employees");
        setEmployees(res.data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, []);
  const [formData, setFormData] = useState({
    employee_id: "",
    salary_month: "",
    base_salary: "",
    bonus: 0,
    deduction: 0,
    payment_date: "",
    basic: 0,
    hra: 0,
    tax: 0,
    pf: 0,
    other_deductions: 0,
    gross_pay: 0,
    net_pay: 0,
    notes: "",
  });
  useEffect(() => {
    if (editingData) {
      setFormData({ ...editingData });
    }
  }, [editingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const endpoint = editingData
        ? `/api/finance/edit/payroll/${editingData.id}`
        : "/api/finance/add/payroll";

      const response = editingData
        ? await putApi(endpoint, formData)
        : await postApi(endpoint, formData);

      toast.success(
        editingData
          ? "Payroll updated successfully!"
          : "Payroll added successfully!"
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Payroll save error:", err.message || err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray bg-opacity-50 overflow-y-auto z-50 p-6 flex items-start justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-lg font-bold mb-4">
          {editingData ? "Edit Payroll" : "Add Payroll"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Employee
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary Month
            </label>
            <input
              type="month"
              name="salary_month"
              value={formData.salary_month}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Salary
            </label>
            <input
              type="number"
              name="base_salary"
              value={formData.base_salary}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus
            </label>
            <input
              type="number"
              name="bonus"
              value={formData.bonus}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deduction
            </label>
            <input
              type="number"
              name="deduction"
              value={formData.deduction}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Basic
            </label>
            <input
              type="number"
              name="basic"
              value={formData.basic}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HRA
            </label>
            <input
              type="number"
              name="hra"
              value={formData.hra}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax
            </label>
            <input
              type="number"
              name="tax"
              value={formData.tax}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PF
            </label>
            <input
              type="number"
              name="pf"
              value={formData.pf}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Deductions
            </label>
            <input
              type="number"
              name="other_deductions"
              value={formData.other_deductions}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gross Pay
            </label>
            <input
              type="number"
              name="gross_pay"
              value={formData.gross_pay}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Net Pay
            </label>
            <input
              type="number"
              name="net_pay"
              value={formData.net_pay}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="border p-2 mt-4 w-full rounded"
        ></textarea>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded cursor-pointer"
          >
            {editingData ? "Update" : "Add"} Payroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditPayrollModal;
