import EmployeeLayout from "@/component/layout/EmployeeLayout";
import { useEffect, useState } from "react";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import { Calendar, Download } from "lucide-react";
import toast from "react-hot-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PayrollSlipPDF from "@/component/payrollModal/PayrollSlipModal";
import { useRouter } from "next/router";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [activeTab, setActiveTab] = useState("payslip");
  const router = useRouter();

  const fetchOwnPayroll = async () => {
    try {
      const res = await getApi("/api/employee/payroll");
      const data = res.data || [];
      setPayrolls(data);

      if (data.length > 0 && !selectedPayroll) {
        setSelectedPayroll(data[0]); // set first payroll (most recent)
      }
    } catch (error) {
      console.error("Payroll fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfCodeExists = async () => {
    try {
      const response = await getApi("/api/employee/check-code");
      setIsFirstTime(!response.exists);
      setCodeModalOpen(true);
    } catch (err) {
      console.error("Error checking code:", err);
    }
  };

  useEffect(() => {
    fetchOwnPayroll();
    checkIfCodeExists();
  }, []);

  const handlePayrollCodeSubmit = async () => {
    if (!code || code.length < 4) {
      toast.error("Please enter at least 4 digits.");
      return;
    }

    const endpoint = isFirstTime
      ? "/api/employee/payroll/set-code"
      : "/api/employee/payroll/verify-code";

    try {
      const res = await postApi(endpoint, { code });
      toast.success(res.message);
      setCodeModalOpen(false);
      fetchOwnPayroll();
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    }
  };

  const handleFetchSlip = async () => {
    if (!selectedMonth) return toast.error("Please select a month.");
    setLoadingSlip(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token not found. Please log in again.");
        setLoadingSlip(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/employee/salary/slip?month=${selectedMonth}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      if (response.ok && json.success) {
        setSelectedPayroll(json.data);
        toast.success("Payroll slip loaded successfully");
      } else {
        setSelectedPayroll(null);
        toast.error(json.message || "Payroll not available for this month.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Something went wrong while fetching the payroll.");
    } finally {
      setLoadingSlip(false);
    }
  };

  // const sortedData = data.sort(
  //   (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
  // );
  // setPayrolls(sortedData);
  // setSelectedPayroll(sortedData[0]);

  return (
    <EmployeeLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 ">
        <h1 className="text-2xl font-bold mb-6">My Payroll</h1>

        {/* Tabs */}
        <div className="flex justify-center gap-8 border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("payslip")}
            className={`pb-2 font-semibold text-base ${
              activeTab === "payslip"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            PAYSLIPS
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`pb-2 font-semibold text-base ${
              activeTab === "structure"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            SALARY STRUCTURE
          </button>
        </div>

        {/* Payslip Cards */}
        {activeTab === "payslip" &&
          (loading ? (
            <p>Loading payroll...</p>
          ) : payrolls.length === 0 ? (
            <p className="text-gray-500">No payroll records found.</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {payrolls.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="text-center px-6 py-4 border-b border-gray-200">
                    <img
                      src="/mobilogi-logo.png"
                      alt="Mobilogi Logo"
                      className="mx-auto mb-2 w-30 h-auto object-contain invert"
                    />
                    <h2 className="text-lg font-bold text-gray-800">
                      Mobilogi Technologies Pvt Ltd
                    </h2>
                    <p className="text-sm text-gray-600 leading-snug">
                      11th Floor, Office No A-1106, Ozone Business Centre,
                      <br />
                      Saboo Siddique Maternity Home Compound, Nagpada, Mumbai -
                      400008
                    </p>
                    <p className="mt-2 font-medium text-gray-700">
                      Payslip for the Month of {p.salary_month}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="p-5 text-sm text-gray-700 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1 text-gray-700">
                        Earnings
                      </h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-t">
                            <td className="py-1">Basic</td>
                            <td className="text-right font-medium">
                              ₹{p.basic}
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-1">HRA</td>
                            <td className="text-right font-medium">₹{p.hra}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-1">Bonus</td>
                            <td className="text-right font-medium">
                              ₹{p.bonus}
                            </td>
                          </tr>
                          <tr className="border-t font-bold">
                            <td className="py-1">Gross</td>
                            <td className="text-right">₹{p.gross_pay}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1 text-gray-700">
                        Deductions
                      </h4>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-t">
                            <td className="py-1">Tax</td>
                            <td className="text-right font-medium">₹{p.tax}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-1">PF</td>
                            <td className="text-right font-medium">₹{p.pf}</td>
                          </tr>
                          <tr className="border-t">
                            <td className="py-1">Other Deductions</td>
                            <td className="text-right font-medium">
                              ₹{p.other_deductions}
                            </td>
                          </tr>
                          <tr className="border-t font-bold">
                            <td className="py-1">Total</td>
                            <td className="text-right">₹{p.deduction}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="font-semibold text-lg text-green-600">
                      Net Pay: ₹{p.net_pay}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border px-3 py-2 rounded-md text-sm"
                      />
                      <button
                        onClick={handleFetchSlip}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Fetch Slip
                      </button>

                      {selectedPayroll && (
                        <PDFDownloadLink
                          document={
                            <PayrollSlipPDF payroll={selectedPayroll} />
                          }
                          fileName={`Payroll-${selectedPayroll.salary_month}.pdf`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          {({ loading }) =>
                            loading ? (
                              "Preparing..."
                            ) : (
                              <span className="flex items-center gap-1">
                                <Download size={14} /> Download
                              </span>
                            )
                          }
                        </PDFDownloadLink>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "structure" && selectedPayroll && (
          <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-700 text-base">
                Current Salary Structure
              </h2>
              <span className="text-sm text-gray-500">
                Effective Date:{" "}
                <span className="font-medium">
                  {new Date(selectedPayroll.payment_date).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </span>
            </div>

            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-blue-50 text-blue-700 text-left">
                  <th className="px-4 py-2 border">Component</th>
                  <th className="px-4 py-2 border">Monthly</th>
                  <th className="px-4 py-2 border">Annual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border font-medium">Basic</td>
                  <td className="px-4 py-2 border">₹{selectedPayroll.basic}</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.basic * 12}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">HRA</td>
                  <td className="px-4 py-2 border">₹{selectedPayroll.hra}</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.hra * 12}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">Bonus</td>
                  <td className="px-4 py-2 border">₹{selectedPayroll.bonus}</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.bonus * 12}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">Tax</td>
                  <td className="px-4 py-2 border">₹{selectedPayroll.tax}</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.tax * 12}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">PF</td>
                  <td className="px-4 py-2 border">₹{selectedPayroll.pf}</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.pf * 12}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">
                    Other Deductions
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.other_deductions}
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.other_deductions * 12}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-2 border"> Gross Pay (Monthly)</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.gross_pay}
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.gross_pay * 12}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-semibold text-green-700">
                  <td className="px-4 py-2 border">Net Pay (In-Hand)</td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.net_pay}
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedPayroll.net_pay * 12}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {codeModalOpen && (
          <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-white p-4 rounded-xl flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6">
              <button
                onClick={() => {
                  if (!code.trim()) {
                    toast.error("You must enter the code to access this page.");
                    return;
                  }
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg"
              >
                &times;
              </button>

              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full shadow mb-4 text-sm font-semibold">
                  {isFirstTime
                    ? "SECURE PAYROLL ACCESS"
                    : "CONFIRM ACCESS CODE"}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  {isFirstTime
                    ? "Set Your Payroll Access Code"
                    : "Enter Your Payroll Code"}
                </h2>

                <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
                  {isFirstTime
                    ? "This code will protect your payroll details. Please remember it!"
                    : "Enter the code you set to view your secure payroll slip."}
                </p>

                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 4567"
                  maxLength={6}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg text-lg tracking-widest text-center mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                  onClick={handlePayrollCodeSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                >
                  {isFirstTime ? "Set Code & Continue" : "Verify & Unlock"}
                </button>

                <button
                  onClick={() => {
                    if (code.trim()) {
                      toast.error("Access restricted until code is verified.");
                    } else {
                      router.back();
                    }
                  }}
                  className="mt-4 text-gray-500 hover:text-red-500 text-sm"
                >
                  Cancel and Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
