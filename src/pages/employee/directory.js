import React, { useEffect, useState } from "react";
import { Mail, Phone, Building2 } from "lucide-react";

import { Users } from "lucide-react";
import { getApi } from "@/utils/ApiurlHelper";
import EmployeeLayout from "@/component/layout/EmployeeLayout";

function EmployeeDirectory() {
  const [directory, setDirectory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDirectory = async () => {
    try {
      const res = await getApi("/api/employee/directory");
      setDirectory(res.data || []);
    } catch (err) {
      console.error("Directory fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  return (
    <EmployeeLayout>
      <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-white p-4 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-white" />
          <h1 className="text-2xl font-bold text-white">Employee Directory</h1>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : directory.length === 0 ? (
          <p className="text-gray-500">No active employees found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {directory.map((emp) => (
              <div
                key={emp.id}
                className="border border-gray-200 rounded-lg shadow p-4 bg-white hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {emp.first_name} {emp.last_name}
                </h2>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Mail size={16} className="text-blue-500" />
                  <span>{emp.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Phone size={16} className="text-green-500" />
                  <span>{emp.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Building2 size={14} className="text-gray-400" />
                  <span>Department ID: {emp.department_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}

export default EmployeeDirectory;
