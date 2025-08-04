import { getApi } from "@/utils/ApiurlHelper";
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    (async () => {
      const res = await getApi("/api/admin/holiday/all");
      setHolidays(res.data || []);
    })();
  }, []);

  const tileClassName = ({ date }) => {
    const match = holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
    return match ? "bg-red-100 text-red-700 rounded-full font-semibold" : null;
  };

  const onActiveMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  const filteredHolidays = holidays.filter((h) => {
    const d = new Date(h.date);
    return (
      d.getMonth() === currentMonth.getMonth() &&
      d.getFullYear() === currentMonth.getFullYear()
    );
  });

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
        📅 Company Holiday Calendar - 2025
      </h2>
      <Calendar
        tileClassName={tileClassName}
        className="rounded-lg p-2"
        calendarType="gregory"
        onActiveStartDateChange={onActiveMonthChange}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          {filteredHolidays.length > 0
            ? `Holidays in ${currentMonth.toLocaleString("default", {
                month: "long",
              })}`
            : "No holidays this month"}
        </h3>
        <ul className="space-y-2">
          {filteredHolidays.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between p-2 border rounded bg-gray-50"
            >
              <span className="font-medium text-gray-800">{h.title}</span>
              <span className="text-sm text-gray-500">
                {new Date(h.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
