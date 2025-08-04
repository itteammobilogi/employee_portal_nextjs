// components/ClientDashboardLayout.js
import dynamic from "next/dynamic";
export default dynamic(() => import("./DashboardLayout"), { ssr: false });
