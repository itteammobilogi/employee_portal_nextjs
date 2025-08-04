import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DashboardLayout from "@/component/layout/DashboardLayout";
import { deleteApi, getApi } from "@/utils/ApiurlHelper";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import AddEditPayrollModal from "@/component/payrollModal/payrollModal";
import toast from "react-hot-toast";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { marginBottom: 8 },
  heading: { fontSize: 16, marginBottom: 12, textAlign: "center" },
});

const PayslipDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.heading}>Payslip</Text>
      <View style={styles.section}>
        <Text>Employee: {data.employee_name}</Text>
      </View>
      <View style={styles.section}>
        <Text>Month: {data.salary_month}</Text>
      </View>
      <View style={styles.section}>
        <Text>Base Salary: ₹{data.base_salary}</Text>
      </View>
      <View style={styles.section}>
        <Text>Bonus: ₹{data.bonus}</Text>
      </View>
      <View style={styles.section}>
        <Text>Deductions: ₹{data.deduction}</Text>
      </View>
      <View style={styles.section}>
        <Text>Gross Pay: ₹{data.gross_pay}</Text>
      </View>
      <View style={styles.section}>
        <Text>Net Pay: ₹{data.net_pay}</Text>
      </View>
      <View style={styles.section}>
        <Text>Tax: ₹{data.tax}</Text>
      </View>
      <View style={styles.section}>
        <Text>PF: ₹{data.pf}</Text>
      </View>
      <View style={styles.section}>
        <Text>Other Deductions: ₹{data.other_deductions}</Text>
      </View>
    </Page>
  </Document>
);

const PayrollTable = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const fetchPayrolls = async () => {
    try {
      const res = await getApi("/api/finance/getallpayrole");
      setPayrollData(res.data || []);
    } catch (err) {
      console.error("Error fetching payroll data", err);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleDownloadPDF = async (item) => {
    const element = document.getElementById(`payslip-${item.id}`);
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: "#fff", // Force white background
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10);
    pdf.save(`Payslip_${item.employee_name}_${item.salary_month}.pdf`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteApi(`/api/finance/delete/${id}`);
      fetchPayrolls();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header + Table only when modal is NOT open */}
      {!showModal && !selectedPayroll && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Payroll Management
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
            >
              + Add Payroll
            </button>
          </div>

          <table className="min-w-full text-sm text-gray-700 bg-white">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="py-3 px-5 text-left">Employee</th>
                <th className="py-3 px-5 text-left">Salary Month</th>
                <th className="py-3 px-5 text-left">Base Salary</th>
                <th className="py-3 px-5 text-left">Bonus</th>
                <th className="py-3 px-5 text-left">Deductions</th>
                <th className="py-3 px-5 text-left">Gross Pay</th>
                <th className="py-3 px-5 text-left">Net Pay</th>
                <th className="py-3 px-5 text-left">Payment Date</th>
                <th className="py-3 px-5 text-left">Increment</th>
                <th className="py-3 px-5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(payrollData) &&
                payrollData.map((item, idx) => (
                  <tr
                    key={item.id}
                    id={`payslip-${item.id}`}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-indigo-50 transition-all duration-200`}
                  >
                    <td className="py-3 px-5 flex items-center gap-3">
                      <img
                        src={item.profile_photo || "/default-user.png"}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <span className="font-semibold">
                        {item.employee_name}
                      </span>
                    </td>
                    <td className="py-3 px-5">{item.salary_month}</td>
                    <td className="py-3 px-5">₹{item.base_salary}</td>
                    <td className="py-3 px-5">₹{item.bonus}</td>
                    <td className="py-3 px-5">₹{item.deduction}</td>
                    <td className="py-3 px-5">₹{item.gross_pay}</td>
                    <td className="py-3 px-5">₹{item.net_pay}</td>
                    <td className="py-3 px-5">{item.payment_date}</td>
                    <td className="py-3 px-5">
                      {item.previous_salary && item.new_salary ? (
                        <div className="text-sm text-green-700">
                          <div className="font-medium">
                            ₹{item.previous_salary} ➜ ₹{item.new_salary}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.reason}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1 w-36">
                        <button
                          onClick={() => setSelectedPayroll(item)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
                        >
                          <Eye size={14} /> View Payslip
                        </button>
                        <button
                          onClick={() => {
                            setEditingData(item);
                            setShowModal(true);
                          }}
                          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs cursor-pointer"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                        {/* <button
                          onClick={() => handleDownloadPDF(item)}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs cursor-pointer"
                        >
                          <Download size={14} /> Download PDF
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {selectedPayroll && (
        <div className="fixed inset-0 z-50 bg-gray bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow max-w-lg w-full">
            <div
              id={`payslip-${selectedPayroll.id}`}
              style={{
                all: "initial",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                borderRadius: "10px",
                width: "100%",
                border: "1px solid #ddd",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>
                Payslip
              </h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                <li>
                  <strong>Employee:</strong> {selectedPayroll.employee_name}
                </li>
                <li>
                  <strong>Month:</strong> {selectedPayroll.salary_month}
                </li>
                <li>
                  <strong>Base Salary:</strong> ₹{selectedPayroll.base_salary}
                </li>
                <li>
                  <strong>Bonus:</strong> ₹{selectedPayroll.bonus}
                </li>
                <li>
                  <strong>Deductions:</strong> ₹{selectedPayroll.deduction}
                </li>
                <li>
                  <strong>Gross Pay:</strong> ₹{selectedPayroll.gross_pay}
                </li>
                <li>
                  <strong>Net Pay:</strong> ₹{selectedPayroll.net_pay}
                </li>
                <li>
                  <strong>Tax:</strong> ₹{selectedPayroll.tax}
                </li>
                <li>
                  <strong>PF:</strong> ₹{selectedPayroll.pf}
                </li>
                <li>
                  <strong>Other Deductions:</strong> ₹
                  {selectedPayroll.other_deductions}
                </li>
              </ul>
            </div>

            <div className="text-right mt-4">
              <button
                onClick={() => setSelectedPayroll(null)}
                className="text-sm bg-indigo-600 text-white px-4 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AddEditPayrollModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingData(null);
        }}
        onSuccess={fetchPayrolls}
        editingData={editingData}
      />
    </DashboardLayout>
  );
};

export default PayrollTable;
