// team.jsx
import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import AddShiftModal from "@/component/shiftModal/AddShiftModal";

function Team() {
  const [employees, setEmployees] = useState([]);
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [savingShift, setSavingShift] = useState(false);

  const [form, setForm] = useState({
    employee_id: "",
    shift_start: "09:00",
    shift_end: "18:00",
    effective_from: dayjs().format("YYYY-MM-DD"),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);

  const fetchEmployees = async () => {
    try {
      const empRes = await getApi("/api/manager/manager/employees");
      if (empRes?.data) setEmployees(empRes.data);
    } catch (err) {
      console.error("fetch employees error:", err);
      toast.error("Failed to load employees.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const indexOfLast = currentPage * employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfLast - employeesPerPage,
    indexOfLast
  );
  const paginate = (n) => setCurrentPage(n);

  const handleSubmitShift = async () => {
    // Validate: employee_id must be a positive integer (avoid 0/falsy problem)
    const empIdNum = Number(form.employee_id);
    if (
      !Number.isFinite(empIdNum) ||
      empIdNum <= 0 ||
      !form.shift_start ||
      !form.shift_end ||
      !form.effective_from
    ) {
      toast.error("Please select employee and fill all fields.");
      return;
    }

    const payload = {
      employee_id: empIdNum,
      shift_start: form.shift_start.trim(), // "HH:mm" is fine
      shift_end: form.shift_end.trim(),
      effective_from: form.effective_from, // already "YYYY-MM-DD"
    };

    try {
      setSavingShift(true);
      const res = await postApi("/api/manager/set/shift", payload);
      toast.success(res.message || "Shift saved");
      setShowAddShiftModal(false);
    } catch (e) {
      console.error("set shift error:", e);
      toast.error(e?.message || "Failed to save shift");
    } finally {
      setSavingShift(false);
    }
  };

  return (
    <div className={showAddShiftModal ? "overflow-hidden" : ""}>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Our Teams</h2>
            <button
              onClick={() => {
                // reset form defaults when opening
                setForm((s) => ({
                  employee_id: "",
                  shift_start: "09:00",
                  shift_end: "18:00",
                  effective_from: dayjs().format("YYYY-MM-DD"),
                }));
                setShowAddShiftModal(true);
              }}
              className="rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700"
            >
              Add Shift
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto rounded-lg bg-white shadow-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Designation</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length ? (
                  currentEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="odd:bg-gray-50 even:bg-gray-100 border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-3 font-semibold">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="px-6 py-3">{emp.email}</td>
                      <td className="px-6 py-3">{emp.phone}</td>
                      <td className="px-6 py-3">{emp.designation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => paginate(currentPage - 1)}
              className={`mx-2 rounded-lg px-4 py-2 ${
                currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
              }`}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              className={`mx-2 rounded-lg px-4 py-2 ${
                currentPage * employeesPerPage >= employees.length
                  ? "bg-gray-300"
                  : "bg-blue-500 text-white"
              }`}
              disabled={currentPage * employeesPerPage >= employees.length}
            >
              Next
            </button>
          </div>
        </div>
      </DashboardLayout>

      {/* Add Shift Modal */}
      <AddShiftModal
        open={showAddShiftModal}
        onClose={() => setShowAddShiftModal(false)}
        employees={employees}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitShift}
        saving={savingShift}
      />
    </div>
  );
}

export default Team;
