import React, { useState, useEffect } from "react";
import { deleteApi, getApi, postApi, putApi } from "@/utils/ApiurlHelper";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/component/layout/DashboardLayout";

function Review() {
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
  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * reviewsPerPage,
    reviewPage * reviewsPerPage
  );

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
  const getAllAttendance = async () => {
    try {
      const attendanceRes = await getApi(
        "/api/manager/manager/team-attendance"
      );

      // Log the full response to inspect its structure
      console.log("Attendance API Response:", attendanceRes); // Log the full response object

      // Ensure you're accessing the correct data path
      if (
        attendanceRes &&
        attendanceRes.success &&
        Array.isArray(attendanceRes.data)
      ) {
        setAttendance(attendanceRes.data); // If the response structure is correct
      } else {
        console.error(
          "Attendance data is not in the expected format:",
          attendanceRes
        );
      }
    } catch (err) {
      console.error("Error fetching attendance:", err.message);
    }
  };

  useEffect(() => {
    getAllEmployees();
    getAllReviews();
    getAllAttendance();
  }, []);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;

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
      <div>
        <section>
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
        </section>
        {showReviewModal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {editingReview ? "Edit Review" : "Add Review"}
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Employee</span>
                  <select
                    name="employee_id"
                    required
                    className="w-full border p-2 rounded"
                    defaultValue={editingReview?.employee_id || ""}
                    disabled={!!editingReview}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Review Date</span>
                  <input
                    type="date"
                    name="review_date"
                    required
                    defaultValue={editingReview?.review_date?.slice(0, 10)}
                    className="w-full border p-2 rounded"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Score (1–10)</span>
                  <input
                    type="number"
                    name="score"
                    min="1"
                    max="10"
                    required
                    defaultValue={editingReview?.score}
                    className="w-full border p-2 rounded"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium">Feedback</span>
                  <textarea
                    name="feedback"
                    required
                    defaultValue={editingReview?.feedback}
                    className="w-full border p-2 rounded"
                  />
                </label>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded cursor-pointer ${
                      editingReview ? "bg-blue-600" : "bg-green-600"
                    } text-white`}
                  >
                    {editingReview ? "Save Changes" : "Add Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Review;
