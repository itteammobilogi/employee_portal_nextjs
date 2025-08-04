import HolidayCalendar from "@/component/holiday/HolidayCalendar";
import DashboardLayout from "@/component/layout/DashboardLayout";
import React from "react";

function Holiday() {
  return (
    <div>
      <DashboardLayout>
        <HolidayCalendar />
      </DashboardLayout>
    </div>
  );
}

export default Holiday;
