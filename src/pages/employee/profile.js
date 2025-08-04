import React, { useEffect, useState } from "react";
import EmployeeLayout from "@/component/layout/EmployeeLayout";
import {
  UserCircle2,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  CalendarDays,
  BadgeInfo,
} from "lucide-react";
import { getApi } from "@/utils/ApiurlHelper";

const Profile = () => {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    getApi("/api/employee/profile")
      .then((data) => {
        if (data.success) {
          setEmployee(data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
      });
  }, []);

  if (!employee) {
    return (
      <EmployeeLayout>
        <div className="p-6 text-center text-gray-600">Loading profile...</div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="p-6 max-w-5xl mx-auto bg-gradient-to-br from-white  via-gray-900 to-black p-4 rounded-xl">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Top Section with Gradient Header */}
          <div className="bg-gradient-to-r from-black to-white p-6 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
              {employee.profile_photo ? (
                <img
                  src={employee.profile_photo}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <UserCircle2 className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Name + Designation */}
            <div className="text-white">
              <h2 className="text-2xl font-bold tracking-wide">
                {employee.first_name} {employee.last_name}
              </h2>
              <p className="text-sm mt-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-white" />
                {employee.designation || "Employee"}
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 grid md:grid-cols-2 gap-4 text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Email:</span> {employee.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-500" />
              <span className="font-medium">Phone:</span> {employee.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="font-medium">Address:</span>{" "}
              {employee.address || "Not provided"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Joining Date:</span>{" "}
              {new Date(employee.date_of_joining).toLocaleDateString("en-IN")}
            </div>
            <div className="flex items-center gap-2">
              <BadgeInfo className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Status:</span>
              <span
                className={`font-semibold ${
                  employee.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Profile;
