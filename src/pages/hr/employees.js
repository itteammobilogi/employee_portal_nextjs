import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi } from "@/utils/ApiurlHelper";
import React, { useEffect, useState } from "react";

function employees() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await getApi("/api/hr/employees");
      console.log(response);
      setEmployees(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  return (
    <div>
      <DashboardLayout>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700 text-left">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Employee</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Department ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{employee.role_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.department_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardLayout>
    </div>
  );
}

export default employees;
