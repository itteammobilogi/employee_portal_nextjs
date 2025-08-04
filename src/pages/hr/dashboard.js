import React, { useEffect, useState } from "react";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import LeaveRequestTable from "@/component/leaveRequestTable/LeaveRequestTable";
import KpiCard from "@/component/leaveRequestTable/KpiCard";
import { Users, FileClock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function HRDashboard() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const fetchEmployees = async () => {
    const res = await getApi("/api/hr/employees");
    setTotalEmployees(res.data?.length || 0);
  };

  const fetchLeaveRequests = async () => {
    try {
      const res = await getApi("/api/hr/leave/request");
      setLeaveRequests(res.leaveRequests || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const pendingLeaves = leaveRequests.filter(
    (l) => l.status === "Pending"
  ).length;
  const approvedThisMonth = leaveRequests.filter(
    (l) =>
      l.status === "Approved" &&
      new Date(l.approved_at).getMonth() === new Date().getMonth()
  ).length;

  if (loading) {
    <p>loading...</p>;
  }

  const handleLeaveStatusUpdate = async (leave_id, status) => {
    try {
      console.log("Updating leave ID:", leave_id, "to", status); // ✅ debug
      const res = await postApi("/api/hr/leave/status", {
        leave_id,
        status,
      });

      toast.success(
        res.message || `Leave ${status.toLowerCase()} successfully`
      );
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error updating leave status:", error);
      toast.error("Failed to update leave status.");
    }
  };

  const handleApprove = (leave_id) =>
    handleLeaveStatusUpdate(leave_id, "Approved");
  const handleReject = (leave_id) =>
    handleLeaveStatusUpdate(leave_id, "Rejected");

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">HR Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Employees"
            value={totalEmployees}
            icon={<Users className="text-blue-600 w-6 h-6" />}
          />
          <KpiCard
            title="Pending Leaves"
            value={pendingLeaves}
            icon={<FileClock className="text-yellow-500 w-6 h-6" />}
          />
          <KpiCard
            title="Approved This Month"
            value={approvedThisMonth}
            icon={<CheckCircle className="text-green-600 w-6 h-6" />}
          />
          <KpiCard
            title="Rejected Leaves"
            value={leaveRequests.filter((l) => l.status === "Rejected").length}
            icon={<XCircle className="text-red-600 w-6 h-6" />}
          />
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Recent Leave Requests</h2>
          <LeaveRequestTable
            data={leaveRequests}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HRDashboard;
