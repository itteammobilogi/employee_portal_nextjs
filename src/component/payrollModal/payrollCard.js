import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PayrollCard = ({ p }) => {
  const slipRef = useRef();

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(slipRef.current, {
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payroll-${p.salary_month}.pdf`);
  };

  return (
    <div
      ref={slipRef}
      className="no-oklchbg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden"
    >
      {/* Header Section */}
      <div className="text-center px-6 py-4 border-b border-gray-200">
        <img
          src="/mobilogi-logo.png"
          alt="Mobilogi Logo"
          crossOrigin="anonymous"
          className="mx-auto mb-2 w-32 h-auto object-contain"
        />
        <h2 className="text-lg font-bold text-gray-800">
          Mobilogi Technologies Pvt Ltd
        </h2>
        <p className="text-sm text-gray-600 leading-snug">
          11th Floor, Office No A-1106, Ozone Business Centre,
          <br />
          Saboo Siddique Maternity Home Compound, Nagpada, Mumbai - 400008
        </p>
        <p className="mt-2 font-medium text-gray-700">
          Payslip for the Month of {p.salary_month}
        </p>
      </div>

      {/* Earnings & Deductions Section */}
      <div className="p-5 text-sm text-gray-700 space-y-4">
        {/* Earnings */}
        <div>
          <h4 className="font-semibold mb-1 text-gray-700">Earnings</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-t">
                <td className="py-1">Basic</td>
                <td className="text-right font-medium">₹{p.basic}</td>
              </tr>
              <tr className="border-t">
                <td className="py-1">HRA</td>
                <td className="text-right font-medium">₹{p.hra}</td>
              </tr>
              <tr className="border-t">
                <td className="py-1">Bonus</td>
                <td className="text-right font-medium">₹{p.bonus}</td>
              </tr>
              <tr className="border-t font-bold">
                <td className="py-1">Gross</td>
                <td className="text-right">₹{p.gross_pay}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <h4 className="font-semibold mb-1 text-gray-700">Deductions</h4>
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

      {/* Footer Section */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="font-semibold text-lg text-green-600">
          Net Pay: ₹{p.net_pay}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Download Payslip
        </button>
      </div>
    </div>
  );
};

export default PayrollCard;
