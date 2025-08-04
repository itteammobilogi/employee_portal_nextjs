import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";

function team() {
  const [employees, setEmployees] = useState([]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("18:00");
  const [effectiveFrom, setEffectiveFrom] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);

  const getAllEmployees = async () => {
    try {
      const empRes = await getApi("/api/manager/manager/employees");
      console.log("Employee API Response:", empRes);

      if (empRes?.data) {
        setEmployees(empRes.data);
        console.log("Employee Data:", empRes.data);
      } else {
        console.error("No employee data available", empRes);
      }

      // You can handle other API calls for reviews and attendance similarly
      // setReviews(reviewRes.data);
      // setAttendance(attendanceRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    }
  };

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  // Handle pagination change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    getAllEmployees();
  }, []);

  const handleSetShiftSubmit = async () => {
    try {
      const payload = {
        employee_id: selectedEmployee.id,
        shift_start: shiftStart,
        shift_end: shiftEnd,
        effective_from: effectiveFrom,
      };

      const res = await postApi(`/api/manager/set/shift`, payload);
      toast.success(res.message || "Shift Updated successfully");
      setShowShiftModal(false);
    } catch (error) {
      console.error("Error setting shift:", error);
      toast.error("Failed to set shift");
    }
  };

  return (
    <div>
      <DashboardLayout>
        <div>
          <h2 className="text-xl font-semibold mb-3">Our Teams</h2>

          <div className="overflow-x-auto mt-5">
            <table className="min-w-full table-auto bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Designation</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) =>
                    employee && employee.email ? (
                      <tr
                        key={employee.id}
                        className="border-b hover:bg-gray-50 odd:bg-gray-50 even:bg-gray-100"
                      >
                        <td className="px-6 py-3 font-semibold">
                          {employee.first_name} {employee.last_name}
                        </td>
                        <td className="px-6 py-3">{employee.email}</td>
                        <td className="px-6 py-3">{employee.phone}</td>
                        <td className="px-6 py-3">{employee.designation}</td>
                        <td className="px-6 py-3">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowShiftModal(true);
                            }}
                          >
                            Set Shift
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={employee.id} className="border-b">
                        <td
                          colSpan="3"
                          className="px-6 py-3 text-center text-red-600"
                        >
                          Invalid employee data
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-3 text-center text-gray-500"
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
              className={`px-4 py-2 mx-2 rounded-lg ${
                currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
              }`}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2">{currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              className={`px-4 py-2 mx-2 rounded-lg ${
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
      {showShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Set Shift for {selectedEmployee?.first_name}
            </h3>

            <label className="block mb-2">Shift Start</label>
            <input
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="border px-3 py-2 mb-4 w-full"
            />

            <label className="block mb-2">Shift End</label>
            <input
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              className="border px-3 py-2 mb-4 w-full"
            />

            <label className="block mb-2">Effective From</label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="border px-3 py-2 mb-4 w-full"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowShiftModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSetShiftSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default team;
