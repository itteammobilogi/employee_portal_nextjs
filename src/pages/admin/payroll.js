import DashboardLayout from "@/component/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { deleteApi, getApi, postApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";
import PayrollSlipModal from "@/component/payrollSlipModel/PayrollSlipModal";
import CreatePayrollModal from "@/component/payrollModal/createPayrollModel";
import { Eye, Trash2 } from "lucide-react";

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchPayrolls = async () => {
    try {
      const res = await getApi("/api/admin/payroll/all");
      console.log("Payroll data:", res); // check structure
      setPayrolls(res.data || []);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      toast.error("Failed to load payrolls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleCreatePayroll = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmitPayroll = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const raw = Object.fromEntries(formData.entries());

    // Convert relevant fields to numbers (defaulting to 0 if empty)
    const basic = parseFloat(raw.basic || 0);
    const hra = parseFloat(raw.hra || 0);
    const bonus = parseFloat(raw.bonus || 0);
    const tax = parseFloat(raw.tax || 0);
    const pf = parseFloat(raw.pf || 0);
    const other_deductions = parseFloat(raw.other_deductions || 0);
    const deduction = other_deductions; // or adjust if other deductions exist separately

    const payload = {
      employee_id: raw.employee_id,
      salary_month: raw.salary_month,
      payment_date: raw.payment_date || null,
      base_salary: basic + hra, // ← Required field
      bonus,
      deduction,
      notes: raw.notes || "",
      basic,
      hra,
      tax,
      pf,
      other_deductions,
    };

    try {
      const res = await postApi("/api/admin/create/payroll", payload);

      if (res.message === "Payroll created successfully.") {
        toast.success("Payroll created successfully.");
        handleCloseModal();
        fetchPayrolls();
      } else {
        toast.error(res.message || "Failed to create payroll.");
      }
    } catch (err) {
      console.error("Error creating payroll:", err);
      toast.error("Something went wrong.");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getApi(`/api/admin/getall/employees`);
      setEmployees(res.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeletePayroll = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this payroll?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteApi(`/api/admin/payroll/${id}`);
      if (res.success) {
        toast.success("Payroll deleted successfully.");
        fetchPayrolls();
      } else {
        toast.error(res.message || "Failed to delete payroll.");
      }
    } catch (error) {
      console.error("Delete payroll error:", error);
      toast.error("Server error while deleting payroll.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Employee Payrolls</h2>
        <div className="flex justify-end mt-6 mb-4">
          <button
            onClick={handleCreatePayroll}
            className="inline-flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Payroll
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-blue-50 text-blue-800 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Basic</th>
                  <th className="px-4 py-3">HRA</th>
                  <th className="px-4 py-3">Bonus</th>
                  <th className="px-4 py-3">Tax</th>
                  <th className="px-4 py-3">PF</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3">Gross</th>
                  <th className="px-4 py-3">Net</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {payrolls.length > 0 ? (
                  payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-2">
                        <span className="font-medium text-gray-900">
                          {p.first_name} {p.last_name}
                        </span>
                        <div className="text-xs text-gray-500">
                          #{p.employee_id}
                        </div>
                      </td>
                      <td className="px-4 py-2">{p.salary_month}</td>
                      <td className="px-4 py-2">₹{p.basic}</td>
                      <td className="px-4 py-2">₹{p.hra}</td>
                      <td className="px-4 py-2">₹{p.bonus}</td>
                      <td className="px-4 py-2">₹{p.tax}</td>
                      <td className="px-4 py-2">₹{p.pf}</td>
                      <td className="px-4 py-2">₹{p.other_deductions}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">
                        ₹{p.gross_pay}
                      </td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        ₹{p.net_pay}
                      </td>
                      <td className="px-4 py-2 flex gap-2 items-center">
                        {/* View Icon */}
                        <button
                          title="View Slip"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setSelectedSlip(p)}
                        >
                          <Eye size={18} />
                        </button>

                        {/* Delete Icon */}
                        <button
                          title="Delete Payroll"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeletePayroll(p.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="text-center px-4 py-6 text-gray-500"
                    >
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedSlip && (
          <PayrollSlipModal
            slip={selectedSlip}
            onClose={() => setSelectedSlip(null)}
          />
        )}

        <CreatePayrollModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPayroll}
          employees={employees}
        />
      </div>
    </DashboardLayout>
  );
}
