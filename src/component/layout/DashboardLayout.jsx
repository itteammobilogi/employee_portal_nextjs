// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import { Menu, X, LogOut } from "lucide-react";

// export default function DashboardLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [roleId, setRoleId] = useState(null);

//   const router = useRouter();

//   const roleMap = {
//     1: "admin",
//     2: "hr",
//     3: "employee",
//     4: "finance",
//     5: "manager",
//   };

//   const navConfig = {
//     admin: [{ label: "Dashboard", path: "/admin/dashboard" }],
//     hr: [{ label: "Dashboard", path: "/hr/dashboard" }],
//     manager: [
//       { label: "Dashboard", path: "/manager/dashboard" },
//       { label: "Team", path: "/manager/team" },
//       { label: "Review", path: "/manager/reviews" },

//       { label: "Employee", path: "/manager/employee/leave" },
//       { label: "Payroll", path: "/manager/employee/payroll" },
//       // { label: "Settings", path: "/manager/settings" },
//     ],
//     finance: [{ label: "Dashboard", path: "/finance/dashboard" }],
//     employee: [{ label: "Dashboard", path: "/employee/dashboard" }],
//   };

//   useEffect(() => {
//     const roleIdFromStorage = localStorage.getItem("role_id");
//     setRoleId(roleIdFromStorage);
//   }, []);

//   const role = roleMap[roleId] || "manager";
//   const navLinks = navConfig[role] || [];

//   return (
//     <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#ffffff]">
//       {/* Sidebar */}
//       <aside
//         className={`${
//           sidebarOpen ? "block" : "hidden"
//         } fixed md:static top-0 left-0 h-full w-64 z-40 transition-all duration-500 md:block bg-white rounded-tr-3xl rounded-br-3xl shadow-[rgba(0,_0,_0,_0.1)_0px_4px_12px]`}
//       >
//         <div className="flex flex-col h-full">
//           <div className="flex items-center justify-between px-6 py-5 border-b text-xl font-bold text-blue-700">
//             {role.charAt(0).toUpperCase() + role.slice(1)} Panel
//             <button
//               className="md:hidden text-blue-500"
//               onClick={() => setSidebarOpen(false)}
//             >
//               <X size={20} />
//             </button>
//           </div>
//           <nav className="px-4 py-6 space-y-3">
//             {navLinks.map((link) => (
//               <button
//                 key={link.path}
//                 onClick={() => {
//                   router.push(link.path);
//                   setSidebarOpen(false);
//                 }}
//                 className={`group relative flex items-center gap-3 px-5 py-3 w-full text-left rounded-lg transition duration-300 ${
//                   router.pathname === link.path
//                     ? "bg-blue-100 text-blue-800 font-semibold shadow"
//                     : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
//                 }`}
//               >
//                 <div
//                   className={`absolute left-0 w-1  h-6 rounded-r-full ${
//                     router.pathname === link.path
//                       ? "bg-blue-500"
//                       : "bg-transparent"
//                   } transition-all`}
//                 ></div>
//                 <span className="transition-transform group-hover:scale-105 cursor-pointer">
//                   {link.label}
//                 </span>
//               </button>
//             ))}
//           </nav>
//         </div>
//       </aside>

//       {/* Main Area */}
//       <div className="flex flex-col flex-1">
//         {/* Topbar */}
//         <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md shadow-lg p-4 mx-4 mt-4 rounded-2xl flex items-center justify-between border border-blue-100">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//               className="md:hidden text-gray-600 hover:text-blue-600"
//             >
//               {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//             <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
//               {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
//             </h1>
//           </div>
//           <div className="text-gray-600 hidden md:flex items-center gap-2 text-sm">
//             Welcome back, <span className="font-medium capitalize">{role}</span>{" "}
//             👋
//             <button
//               onClick={() => {
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("role_id");
//                 router.push("/login");
//               }}
//               className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium border border-red-300 hover:border-red-600 px-3 py-1.5 rounded transition"
//             >
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-white/70 m-4 mt-6 rounded-2xl shadow-md backdrop-blur-md">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Menu, X, LogOut } from "lucide-react";
import { navConfig } from "@/utils/navConfig";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [navLinks, setNavLinks] = useState([]);
  const [roleName, setRoleName] = useState("user");

  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role_id");
    const storedDept = localStorage.getItem("department_id");

    setRoleId(storedRole);
    setDepartmentId(storedDept);

    const roleNum = parseInt(storedRole);
    const deptNum = parseInt(storedDept);

    const configForRole = navConfig[roleNum] || {};
    const links = configForRole[deptNum] || configForRole["any"] || [];

    setNavLinks(links);

    const roleMap = {
      1: "admin",
      2: "hr",
      3: "employee",
      4: "finance",
      5: "manager",
    };

    setRoleName(roleMap[storedRole] || "user");
  }, []);

  return (
    <div className="flex min-h-screen overflow-y-hidden overflow-x-visible bg-gradient-to-br from-[#dbeafe] via-[#f0f9ff] to-[#ffffff]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed md:static top-0 left-0 h-full w-64 z-40 transition-all duration-500 md:block bg-white rounded-tr-3xl rounded-br-3xl shadow-[rgba(0,_0,_0,_0.1)_0px_4px_12px]`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <Image
              src="/mobilogi-logo.png"
              alt="Company Logo"
              width={140}
              height={36}
              priority
              className="h-9 w-auto object-contain invert"
            />

            {/* Close button */}
            <button
              className="md:hidden text-blue-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="px-4 py-6 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  router.push(link.path);
                  setSidebarOpen(false);
                }}
                className={`group relative flex items-center gap-3 px-5 py-3 w-full text-left rounded-lg transition duration-300 ${
                  router.pathname === link.path
                    ? "bg-blue-100 text-blue-800 font-semibold shadow"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <div
                  className={`absolute left-0 w-1 h-6 rounded-r-full ${
                    router.pathname === link.path
                      ? "bg-blue-500"
                      : "bg-transparent"
                  } transition-all`}
                ></div>
                <span className="transition-transform group-hover:scale-105 cursor-pointer">
                  {link.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md shadow-lg p-4 mx-4 mt-4 rounded-2xl flex items-center justify-between border border-blue-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 hover:text-blue-600"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              {roleName.charAt(0).toUpperCase() + roleName.slice(1)} Dashboard
            </h1>
          </div>
          <div className="text-gray-600 hidden md:flex items-center gap-2 text-sm">
            Welcome back,{" "}
            <span className="font-medium capitalize">{roleName}</span> 👋
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role_id");
                localStorage.removeItem("department_id");
                router.push("/login");
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium border border-red-300 hover:border-red-600 px-3 py-1.5 rounded transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8 bg-white/70 m-4 mt-6 rounded-2xl shadow-md backdrop-blur-md">
          {children}
        </main>
      </div>
    </div>
  );
}
