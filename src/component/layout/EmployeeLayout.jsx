import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getApi } from "@/utils/ApiurlHelper";
import {
  LogOut,
  User,
  CalendarCheck,
  FileText,
  Briefcase,
  CreditCard,
} from "lucide-react";

export default function EmployeeLayout({ children }) {
  const [employeeName, setEmployeeName] = useState("Employee");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await getApi("/api/employee/profile", {
          Authorization: `Bearer ${token}`,
        });

        if (res?.data) {
          const name = `${res.data.first_name} ${res.data.last_name}`;
          setEmployeeName(name);
          localStorage.setItem("employee_name", name); // optional cache
        }
      } catch (err) {
        console.error("Failed to load employee profile", err);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        {/* Left Side: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/employee/dashboard")}
        >
          <img
            src="/mobilogi-logo.png"
            alt="Mobilogi Logo"
            className="h-8 sm:h-10 w-auto invert"
          />
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <h1 className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Welcome, {employeeName}
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </button>
        </div>

        {/* Mobile Menu: Only Logout Button */}
        <div className="sm:hidden">
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 flex items-center text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 px-4 py-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-inner flex justify-around items-center py-2 md:hidden rounded-t-xl rounded-b-xl mx-2">
        <NavIcon label="Profile" path="/employee/profile" icon={<User />} />
        <NavIcon
          label="Attendance"
          path="/employee/attendance"
          icon={<CalendarCheck />}
        />
        <NavIcon label="Leaves" path="/employee/leaves" icon={<FileText />} />
        <NavIcon
          label="Payroll"
          path="/employee/payroll"
          icon={<CreditCard />}
        />
        <NavIcon
          label="Expenses"
          path="/employee/expenses"
          icon={<Briefcase />}
        />
      </nav>
    </div>
  );
}

function NavIcon({ label, path, icon }) {
  const router = useRouter();
  const isActive = router.pathname === path;

  return (
    <button
      onClick={() => router.push(path)}
      className={`flex flex-col items-center text-sm ${
        isActive ? "text-blue-600 font-semibold" : "text-gray-500"
      } hover:text-blue-600`}
    >
      {icon}
      <span className="text-xs mt-0.5">{label}</span>
    </button>
  );
}
