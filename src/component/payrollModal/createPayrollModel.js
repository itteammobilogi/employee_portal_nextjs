// CreatePayrollModal.jsx
import { createPortal } from "react-dom";

export default function CreatePayrollModal({
  isOpen,
  onClose,
  onSubmit,
  employees = [],
}) {
  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex h-full w-full items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.(); // close on backdrop click
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Panel: no vh, just fill available height */}
      <div
        className="relative w-[min(95vw,760px)] max-h-full overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
          title="Close"
        >
          ✕
        </button>

        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          Create Payroll
        </h2>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-sm text-gray-700"
        >
          {/* Select Employee */}
          <div className="sm:col-span-2">
            <label htmlFor="employee_id" className="mb-1 block font-medium">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              id="employee_id"
              name="employee_id"
              required
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="salary_month" className="mb-1 block font-medium">
              Salary Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              id="salary_month"
              name="salary_month"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment_date" className="mb-1 block font-medium">
              Payment Date
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Basic */}
          <div>
            <label htmlFor="basic" className="mb-1 block font-medium">
              Basic
            </label>
            <input
              type="number"
              id="basic"
              name="basic"
              placeholder="₹"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bonus */}
          <div>
            <label htmlFor="bonus" className="mb-1 block font-medium">
              Bonus
            </label>
            <input
              type="number"
              id="bonus"
              name="bonus"
              placeholder="₹"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tax */}
          <div>
            <label htmlFor="tax" className="mb-1 block font-medium">
              Tax
            </label>
            <input
              type="number"
              id="tax"
              name="tax"
              placeholder="₹"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PF */}
          <div>
            <label htmlFor="pf" className="mb-1 block font-medium">
              PF
            </label>
            <input
              type="number"
              id="pf"
              name="pf"
              placeholder="₹"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Other Deductions */}
          <div>
            <label
              htmlFor="other_deductions"
              className="mb-1 block font-medium"
            >
              Other Deductions
            </label>
            <input
              type="number"
              id="other_deductions"
              name="other_deductions"
              placeholder="₹"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="mb-1 block font-medium">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Any remarks or comments..."
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Submit Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
