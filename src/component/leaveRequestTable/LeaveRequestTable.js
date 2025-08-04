import { Check, X } from "lucide-react";

const LeaveRequestTable = ({ data = [], onApprove, onReject }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-5 py-3 font-semibold">#</th>
            <th className="px-5 py-3 font-semibold">Employee</th>
            <th className="px-5 py-3 font-semibold">Department</th>
            {/* <th className="px-5 py-3 font-semibold">Type</th> */}
            <th className="px-5 py-3 font-semibold">Reason</th>
            <th className="px-5 py-3 font-semibold">From</th>
            <th className="px-5 py-3 font-semibold">To</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-center font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center py-4 text-gray-500">
                No leave requests found.
              </td>
            </tr>
          ) : (
            data.map((leave, index) => (
              <tr
                key={leave.id}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-5 py-3">{index + 1}</td>
                <td className="px-5 py-3">
                  {leave.first_name} {leave.last_name}
                </td>
                <td className="px-5 py-3">{leave.department_name || "—"}</td>
                {/* <td className="px-5 py-3">{leave.leave_type || "—"}</td> */}
                <td className="px-5 py-3">{leave.reason || "—"}</td>
                <td className="px-5 py-3">{leave.start_date || "—"}</td>
                <td className="px-5 py-3">{leave.end_date || "—"}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      leave.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : leave.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  {leave.status === "Pending" ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onApprove(leave.id)}
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onReject(leave.request_id || leave.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">–</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequestTable;
