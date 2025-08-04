import React from "react";

const PayrollSlipModal = ({ slip, onClose }) => {
  if (!slip) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Salary Slip – {slip.salary_month}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-gray-800 space-y-2">
          <div>
            <p>
              <strong>Employee:</strong> {slip.first_name} {slip.last_name} (#
              {slip.employee_id})
            </p>
            <p>
              <strong>Month:</strong> {slip.salary_month}
            </p>
          </div>

          <hr />

          <div>
            <p>
              <strong>Basic:</strong> ₹{slip.basic}
            </p>
            <p>
              <strong>HRA:</strong> ₹{slip.hra}
            </p>
            <p>
              <strong>Bonus:</strong> ₹{slip.bonus}
            </p>
            <p>
              <strong>Gross Pay:</strong> ₹{slip.gross_pay}
            </p>
          </div>

          <hr />

          <div>
            <p>
              <strong>Tax:</strong> ₹{slip.tax}
            </p>
            <p>
              <strong>PF:</strong> ₹{slip.pf}
            </p>
            <p>
              <strong>Other Deductions:</strong> ₹{slip.other_deductions}
            </p>
          </div>

          <hr />

          <p className="font-bold text-green-600">Net Pay: ₹{slip.net_pay}</p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollSlipModal;
