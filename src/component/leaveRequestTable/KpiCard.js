import React from "react";

const KpiCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-4 transition duration-300 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );
};

export default KpiCard;
