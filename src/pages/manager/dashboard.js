import DashboardLayout from "@/component/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { deleteApi, getApi, postApi, putApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";
import { Pencil, Search, Trash2 } from "lucide-react";

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(5);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 5;
  // const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * reviewsPerPage,
    reviewPage * reviewsPerPage
  );
  const [summary, setSummary] = useState({
    total_team_members: 0,
    present_today: 0,
  });

  const getAllEmployees = async () => {
    try {
      const empRes = await getApi("/api/manager/manager/employees");
      console.log("Employee API Response:", empRes);

      if (empRes?.data) {
        setEmployees(empRes.data); // Use 'empRes.data' since it's already the array
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

  const getAllReviews = async () => {
    try {
      const reviewRes = await getApi("/api/manager/manager/my-reviews");
      console.log("Review API Response:", reviewRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    }
  };

  // Function to fetch attendance data
  const getAllAttendance = async (search = "") => {
    try {
      const attendanceRes = await getApi(
        `/api/manager/manager/team-attendance?search=${encodeURIComponent(
          search
        )}`
      );

      if (
        attendanceRes &&
        attendanceRes.success &&
        Array.isArray(attendanceRes.data)
      ) {
        setAttendance(attendanceRes.data);

        if (attendanceRes.summary) {
          setSummary(attendanceRes.summary);
        }
      } else {
        console.error("Unexpected response format:", attendanceRes);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
    }
  };

  useEffect(() => {
    getAllEmployees();
    getAllReviews();
    const delayDebounce = setTimeout(() => {
      getAllAttendance(searchQuery); // pass query to fetch filtered data
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  // const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedAttendance = attendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  function handleOpenAdd() {
    setEditingReview(null);
    setShowReviewModal(true);
  }

  // Open Edit-Review modal
  function handleEditClick(review) {
    setEditingReview(review);
    setShowReviewModal(true);
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const payload = {
      ...(editingReview === null && { employee_id: form.get("employee_id") }),
      review_date: form.get("review_date"),
      score: parseInt(form.get("score"), 10),
      feedback: form.get("feedback"),
    };

    try {
      if (editingReview) {
        // Edit path
        await putApi(
          `/api/manager/manager/performance/${editingReview.id}`,
          payload
        );
        toast.success("Review updated successfully");
      } else {
        // Add path
        await postApi("/api/manager/manager/performance", payload);
        toast.success("Review added successfully");
      }
      await getAllReviews();
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  }

  const handleDeleteReview = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteApi(`/api/manager/manager/performance/${id}`);
      toast.success("Review deleted successfully");
      await getAllReviews();
      // Optionally refresh reviews list here
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Employee Summary Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Employee Summary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="font-semibold text-lg">Total Employees</div>
              <div className="text-gray-600">{employees.length}</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Team Attendance Today
              </h2>
              <p className="text-3xl font-bold text-indigo-600">
                {summary.present_today} / {summary.total_team_members}
              </p>
              <p className="text-sm text-gray-500">
                Employees clocked in today
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="font-semibold text-lg">Submitted Performance</div>
              <div className="text-gray-600">{reviews.length}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="font-semibold text-lg">Total Managers</div>
              <div className="text-gray-600">
                {employees.filter((e) => e.role_id === 5).length}
              </div>
            </div>
          </div>
        </section>

        {/* <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Submitted Reviews</h2>
            <button
              onClick={handleOpenAdd}
              className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              Add Review
            </button>
          </div>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-purple-100 text-purple-700 text-left">
                <tr>
                  <th className="p-2">Employee Name</th>
                  <th className="p-2">Period</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Feedback</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="p-2">{r.review_period}</td>
                      <td className="p-2">
                        {new Date(r.review_date).toLocaleDateString("en-GB")}
                      </td>

                      <td className="p-2">{r.score}</td>
                      <td className="p-2">{r.feedback}</td>
                      <td className="p-2 space-x-2">
                        <button onClick={() => handleEditClick(r)}>
                          <Pencil className="w-5 h-5 text-blue-500 cursor-pointer" />
                        </button>
                        <button onClick={() => handleDeleteReview(r.id)}>
                          <Trash2 className="w-5 h-5 text-red-500 cursor-pointer" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-3 text-center text-gray-500"
                    >
                      No reviews submitted
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!showReviewModal && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setReviewPage((p) => Math.max(p - 1, 1))}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Previous
              </button>
              <span>
                Page {reviewPage} of{" "}
                {Math.ceil(reviews.length / reviewsPerPage)}
              </span>
              <button
                onClick={() =>
                  setReviewPage((p) =>
                    p < Math.ceil(reviews.length / reviewsPerPage) ? p + 1 : p
                  )
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Next
              </button>
            </div>
          )}
        </section> */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Team Attendance</h2>

          <div className="flex items-center mb-4 max-w-sm">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search employee name..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-purple-100 text-purple-700 text-left">
                <tr>
                  <th className="p-2">Employee Name</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Clock In</th>
                  <th className="p-2">Clock Out</th>
                  <th className="p-2">Working Hour</th>
                  <th className="p-2">Worked Hour</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((a, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        {a.first_name} {a.last_name}
                      </td>
                      <td className="p-2">
                        {new Date(a.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="p-2">{a.clock_in}</td>
                      <td className="p-2">{a.clock_out}</td>
                      <td className="p-2">
                        {a.clock_out ? (
                          a.worked_hours < a.working_hours ? (
                            <span className="text-red-600 font-semibold">
                              {a.worked_hours}
                            </span>
                          ) : (
                            a.worked_hours
                          )
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>

                      <td className="p-2">{a.worked_hours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-3 text-center text-gray-500"
                    >
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of{" "}
              {Math.ceil(attendance.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  p < Math.ceil(attendance.length / itemsPerPage) ? p + 1 : p
                )
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
