import React, { useState, useEffect } from "react";

const CreatePayrollModal = ({ isOpen, onClose, onSubmit, employees = [] }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-xl p-6 relative animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Create Payroll
        </h2>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700"
        >
          {/* Select Employee */}
          <div className="col-span-2">
            <label htmlFor="employee_id" className="font-medium block mb-1">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              id="employee_id"
              name="employee_id"
              required
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Salary Month */}
          <div>
            <label htmlFor="salary_month" className="font-medium block mb-1">
              Salary Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              id="salary_month"
              name="salary_month"
              className="border px-4 py-2 rounded-lg w-full"
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment_date" className="font-medium block mb-1">
              Payment Date
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Basic */}
          <div>
            <label htmlFor="basic" className="font-medium block mb-1">
              Basic
            </label>
            <input
              type="number"
              id="basic"
              name="basic"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* HRA */}
          <div>
            <label htmlFor="hra" className="font-medium block mb-1">
              HRA
            </label>
            <input
              type="number"
              id="hra"
              name="hra"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Bonus */}
          <div>
            <label htmlFor="bonus" className="font-medium block mb-1">
              Bonus
            </label>
            <input
              type="number"
              id="bonus"
              name="bonus"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Tax */}
          <div>
            <label htmlFor="tax" className="font-medium block mb-1">
              Tax
            </label>
            <input
              type="number"
              id="tax"
              name="tax"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* PF */}
          <div>
            <label htmlFor="pf" className="font-medium block mb-1">
              PF
            </label>
            <input
              type="number"
              id="pf"
              name="pf"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Other Deductions */}
          <div>
            <label
              htmlFor="other_deductions"
              className="font-medium block mb-1"
            >
              Other Deductions
            </label>
            <input
              type="number"
              id="other_deductions"
              name="other_deductions"
              placeholder="₹"
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label htmlFor="notes" className="font-medium block mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any remarks or comments..."
              className="border px-4 py-2 rounded-lg w-full"
            />
          </div>

          {/* Submit Button */}
          <div className="col-span-2">
            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayrollModal;
