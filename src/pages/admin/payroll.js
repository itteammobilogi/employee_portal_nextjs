import DashboardLayout from "@/component/layout/DashboardLayout";
import { useCallback, useEffect, useState } from "react";
import { deleteApi, getApi, postApi, putApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";
import PayrollSlipModal from "@/component/payrollSlipModel/PayrollSlipModal";
import CreatePayrollModal from "@/component/payrollModal/createPayrollModel";
import { Edit, Edit2, Eye, Trash2 } from "lucide-react";

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState(""); // what user types
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState(null);

  const formatINR = (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

  const fetchPayrolls = useCallback(
    async (signal) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search: search, // already debounced
        });

        // If your getApi accepts a RequestInit, pass { signal }.
        // If not, just call getApi(url) and remove the signal guards.
        const res = await getApi(
          `/api/admin/payroll/all?${params.toString()}`,
          { signal }
        );

        if (signal?.aborted) return;

        // Back-end (as suggested) returns: { data, total, totalPages, page }
        const rows = res?.data || [];
        const tp =
          res?.totalPages ??
          (res?.total ? Math.max(1, Math.ceil(res.total / limit)) : 1);

        setPayrolls(rows);
        setTotalPages(tp);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Error fetching payrolls:", err);
          toast.error("Failed to load payrolls.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, limit, search]
  );

  // Debounce the search text
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // always reset to first page on new search
      setSearch(searchInput.trim()); // set debounced query
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch whenever page/limit/search change
  useEffect(() => {
    const ac = new AbortController();
    fetchPayrolls(ac.signal);
    return () => ac.abort();
  }, [fetchPayrolls]);

  const handleCreatePayroll = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEditModal = (row) => {
    setEditing(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSubmitPayroll = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const raw = Object.fromEntries(formData.entries());

    // numbers
    const n = (v) => parseFloat(v || 0);
    const basic = n(raw.basic);
    const hra = n(raw.hra); // ← HRA was missing in your form; add it below
    const bonus = n(raw.bonus);
    const tax = n(raw.tax);
    const pf = n(raw.pf);
    const other_deductions = n(raw.other_deductions);
    const deduction = other_deductions;

    const payload = {
      employee_id: raw.employee_id,
      salary_month: raw.salary_month, // "YYYY-MM"
      payment_date: raw.payment_date || null,
      base_salary: basic + hra, // required by API
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
      const isEdit = Boolean(editing?.id);
      const url = isEdit
        ? `/api/admin/payroll/${editing.id}`
        : `/api/admin/create/payroll`;

      const res = isEdit
        ? await putApi(url, payload)
        : await postApi(url, payload);

      const okMsg = isEdit
        ? "Payroll updated successfully."
        : "Payroll created successfully.";
      if (res.message?.toLowerCase().includes("success")) {
        toast.success(okMsg);
        handleCloseModal();
        fetchPayrolls();
      } else {
        toast.error(
          res.message ||
            (isEdit ? "Failed to update payroll." : "Failed to create payroll.")
        );
      }
    } catch (err) {
      // 409 from server when duplicate (same employee_id + month)
      if (err?.status === 409 || err?.response?.status === 409) {
        toast.error("Payroll for this employee & month already exists.");
      } else {
        console.error("Submit payroll error:", err);
        toast.error("Something went wrong.");
      }
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
      <div className="p-6 ">
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

        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or month (YYYY-MM)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-80"
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="relative -mx-4 sm:mx-0">
            <div
              className="overflow-x-auto w-full max-w-full rounded-lg shadow border border-gray-200"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table className="min-w-[1200px] md:min-w-full w-max text-sm text-left">
                <thead className="bg-blue-50 text-blue-800 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Employee</th>
                    <th className="px-4 py-3 whitespace-nowrap">Month</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Basic
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      HRA
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Bonus
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Tax
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      PF
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Deductions
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Gross
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Net
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {payrolls.length > 0 ? (
                    payrolls.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 align-top">
                          <div className="font-medium text-gray-900">
                            {p.first_name} {p.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            #{p.employee_id}
                          </div>
                        </td>
                        <td className="px-4 py-2 align-top whitespace-nowrap">
                          {p.salary_month}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.basic)}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.hra)}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.bonus)}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.tax)}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.pf)}
                        </td>
                        <td className="px-4 py-2 align-top text-right tabular-nums whitespace-nowrap">
                          {formatINR(p.other_deductions)}
                        </td>
                        <td className="px-4 py-2 align-top text-right font-medium text-gray-900 tabular-nums whitespace-nowrap">
                          {formatINR(p.gross_pay)}
                        </td>
                        <td className="px-4 py-2 align-top text-right font-bold text-green-600 tabular-nums whitespace-nowrap">
                          {formatINR(p.net_pay)}
                        </td>
                        <td className="px-4 py-2 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              title="View Slip"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => setSelectedSlip(p)}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              title="Edit Payroll"
                              className="text-amber-600 hover:text-amber-800"
                              onClick={() => openEditModal(p)}
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              title="Delete Payroll"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeletePayroll(p.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="text-center px-4 py-6 text-gray-500"
                      >
                        No payroll records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            ← Prev
          </button>

          <span className="text-sm text-gray-700">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              page === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next →
          </button>
        </div>
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
          mode={editing ? "edit" : "create"}
          initial={editing}
        />
      </div>
    </DashboardLayout>
  );
}
