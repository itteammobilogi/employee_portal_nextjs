export const navConfig = {
  1: {
    any: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Employees", path: "/admin/employees" },
      { label: "Attendance", path: "/admin/attendance" },
      { label: "Leaves", path: "/admin/leaves/leave" },
      { label: "Payroll", path: "/admin/payroll" },
      { label: "Salary Increments", path: "/admin/employees/salary" },
      { label: "Holiday", path: "/admin/holiday/holiday" },
    ],
  },
  2: {
    any: [
      { label: "Dashboard", path: "/hr/dashboard" },
      { label: "Employees", path: "/hr/employees" },
    ],
  },
  3: [
    { label: "My Profile", path: "/employee/dashboard" },
    { label: "My Profile", path: "/employee/profile" },
    { label: "Attendance", path: "/employee/attendance" },
    { label: "Leaves", path: "/employee/leaves" },
    { label: "Payroll", path: "/employee/payroll" },
    { label: "Performance", path: "/employee/performance" },
    { label: "Expenses", path: "/employee/expenses" },
    { label: "Holidays", path: "/employee/holidays" },
    { label: "Employee Directory", path: "/employee/directory" },
    { label: "ID Card", path: "/employee/id-card" },
    { label: "Change Password", path: "/employee/change-password" },
  ],
  4: {
    4: [{ label: "Dashboard", path: "/finance/dashboard" }],
  },
  5: {
    any: [
      { label: "Dashboard", path: "/manager/dashboard" },
      { label: "Review", path: "/manager/reviews" },
      { label: "Team", path: "/manager/team" },
      { label: "Employee Leave", path: "/manager/employee/leave" },
      { label: "Payroll", path: "/manager/employee/payroll" },
      // { label: "Holiday", path: "/manager/holiday" },
      { label: "Expenses", path: "/manager/expense" },
    ],
  },
};
