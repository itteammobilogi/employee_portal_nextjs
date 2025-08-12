import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getApi, postApi } from "@/utils/ApiurlHelper";
import { motion } from "framer-motion";
import { getFirstRouteByRole } from "@/utils/navHelper";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getApi("/auth/get/departments");
        setDepartments(res || []);
      } catch (err) {
        console.error("Error loading departments", err);
      }
    };

    fetchDepartments();
  }, []);

  // const handleLogin = async () => {
  //   try {
  //     const payload = {
  //       email,
  //       password,
  //     };

  //     if (
  //       email.toLowerCase() !== "adminakbar@mobilogi.com" &&
  //       email.toLowerCase() !== "hr@mobilogi.com"
  //     ) {
  //       if (!selectedDept) {
  //         alert("Please select a department");
  //         return;
  //       }
  //       payload.department_id = selectedDept;
  //     }

  //     const res = await postApi("/api/auth/login", payload);

  //     const { token, role_id, department_id } = res;

  //     localStorage.setItem("token", token);
  //     localStorage.setItem("role_id", role_id);
  //     localStorage.setItem("department_id", department_id);

  //     const routeMap = {
  //       1: "/admin/dashboard",
  //       2: "/hr/dashboard",
  //       "3-1": "/employee/dashboard",
  //       "3-3": "/employee/dashboard",
  //       "3-5": "/employee/dashboard",
  //       "4-4": "/finance/dashboard",
  //       "5-1": "/manager/dashboard",
  //       "5-2": "/manager/dashboard",
  //       "5-3": "/manager/dashboard",
  //     };

  //     const key = `${role_id}-${department_id}`;
  //     const fallback = "/dashboard";

  //     router.push(routeMap[key] || routeMap[role_id] || fallback);
  //   } catch (err) {
  //     alert(err.message || "Login failed");
  //   }
  // };

  const handleLogin = async () => {
    try {
      const payload = { email, password };

      if (
        email.toLowerCase() !== "adminakbar@mobilogi.com" &&
        email.toLowerCase() !== "hr@mobilogi.com"
      ) {
        if (!selectedDept) {
          alert("Please select a department");
          return;
        }
        payload.department_id = selectedDept;
      }

      const res = await postApi("/api/auth/login", payload);
      const { token, role_id, department_id } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("role_id", role_id);
      localStorage.setItem("department_id", department_id);

      const redirectPath = getFirstRouteByRole(role_id, department_id);
      router.push(redirectPath);
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  useEffect(() => {
    if (
      email.toLowerCase() === "adminakbar@mobilogi.com" ||
      email.toLowerCase() === "hr@mobilogi.com"
    ) {
      setSelectedDept("");
    }
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-5xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="md:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col justify-center items-center p-10 relative"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl"
          ></motion.div>
          <h2 className="text-4xl font-extrabold mb-4">Welcome Back!</h2>
          <p className="text-sm text-white/80 text-center">
            Enter your credentials to access your dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="md:w-1/2 bg-white/5 backdrop-blur-lg p-10 flex flex-col justify-center"
        >
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">
            Sign In
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-6"
          >
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-transparent border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-transparent border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
            <div className="relative">
              {email.toLowerCase() !== "adminakbar@mobilogi.com" &&
                email.toLowerCase() !== "hr@mobilogi.com" && (
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-transparent border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option
                        key={dept.id}
                        value={dept.id}
                        className="text-black"
                      >
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                )}
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 mt-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 transition"
            >
              Login
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
