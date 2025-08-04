import React, { useEffect, useState } from "react";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { deleteApi, getApi, postApi, putApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "lucide-react";
import SelectDropdown from "@/utils/customDropdown";

export default function EmployeesPage() {
  const defaultEmployee = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    gender: "Male",
    address: "",
    date_of_joining: "",
    role_id: "",
    department_id: "",
    designation: "",
    status: "Active",
    profile_photo: null,
  };

  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "HR" },
    { id: 3, name: "Employee" },
    { id: 4, name: "Finance" },
    { id: 5, name: "Manager" },
  ];

  const departments = [
    { id: 1, name: "IT" },
    { id: 2, name: "Marketing" },
    { id: 3, name: "Graphic" },
    { id: 4, name: "Finance" },
    { id: 5, name: "Support" },
  ];

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [addEmployeeModal, setAddEmployeeModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState(defaultEmployee);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getApi(
        `/api/admin/getall/employees?page=${page}&limit=${limit}`
      );

      if (data?.employees && data?.totalPages !== undefined) {
        setEmployees(data.employees);
        setTotalPages(data.totalPages);
      } else {
        console.error("Unexpected response format", data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const handleCreateOrUpdateEmployee = async () => {
    try {
      const endpoint = editEmployee
        ? `/api/admin/update/employee/${editEmployee.id}`
        : `/api/admin/create/employee`;

      const res = editEmployee
        ? await putApi(endpoint, newEmployee)
        : await postApi(endpoint, newEmployee);

      alert(res.message);

      setAddEmployeeModal(false);
      setEditEmployee(null);
      setNewEmployee(defaultEmployee);
      fetchEmployees();
    } catch (error) {
      // console.error("Submit Error:", error);
      alert(error.message || "Failed to submit employee");
    }
  };

  const handleDeleteEmployeeModal = async (id) => {
    try {
      const response = await deleteApi(`/api/admin/delete/employee/${id}/soft`);
      toast.success("Employee Deleted Successfully !");
      fetchEmployees();
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setNewEmployee(defaultEmployee);
              setEditEmployee(null);
              setAddEmployeeModal(true);
            }}
          >
            + Add Employee
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.length > 0 ? (
                  employees.map((emp, i) => (
                    <tr key={emp.id}>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {emp.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {emp.designation}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          className="text-blue-500 hover:underline mr-4"
                          onClick={() => {
                            setNewEmployee(emp);
                            setEditEmployee(emp);
                            setAddEmployeeModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDeleteEmployeeModal(emp.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-end items-center gap-4 mt-6">
          <button
            onClick={() => setPage(page - 1)}
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
            onClick={() => setPage(page + 1)}
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
      </div>

      {addEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-semibold text-center mb-6">
              {editEmployee ? "Edit Employee" : "Add New Employee"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="First Name"
                value={newEmployee.first_name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, first_name: e.target.value })
                }
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Last Name"
                value={newEmployee.last_name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, last_name: e.target.value })
                }
              />
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
              />
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Password"
                value={newEmployee.password}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Phone"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                value={newEmployee.dob}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, dob: e.target.value })
                }
              />
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                value={newEmployee.gender}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, gender: e.target.value })
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Address"
                value={newEmployee.address}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, address: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                value={newEmployee.date_of_joining}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    date_of_joining: e.target.value,
                  })
                }
              />
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder-gray-500"
                placeholder="Designation"
                value={newEmployee.designation}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    designation: e.target.value,
                  })
                }
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() =>
                        setNewEmployee({ ...newEmployee, role_id: role.id })
                      }
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        newEmployee.role_id === role.id
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() =>
                        setNewEmployee({
                          ...newEmployee,
                          department_id: dept.id,
                        })
                      }
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        newEmployee.department_id === dept.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Profile Photo Upload */}
              <div className="w-full flex flex-col items-start">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewEmployee({ ...newEmployee, profile_photo: file });
                    }
                  }}
                  className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer py-2 px-3 bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAddEmployeeModal(false);
                  setEditEmployee(null);
                }}
                className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrUpdateEmployee}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                {editEmployee ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
