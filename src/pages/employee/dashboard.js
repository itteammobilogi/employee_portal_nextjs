import { useEffect, useState } from "react";
import { getApi, getRaw, postApi, postRaw } from "@/utils/ApiurlHelper";
import EmployeeLayout from "@/component/layout/EmployeeLayout";
import {
  CalendarDays,
  LogIn,
  LogOut,
  FileText,
  BadgeCheck,
  Badge,
  UserCircle,
  ClipboardCheck,
  Wallet,
  User,
  AlarmClock,
  Clock,
  CalendarCheck2,
  Phone,
  Users,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { getDistance } from "geolib";
import WebcamModal from "@/component/webCamModal/webCamModal";
import toast from "react-hot-toast";

const getLiveLocation = () =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => reject(new Error("Location access denied"))
    );
  });

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || null;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState({});
  const [attendance, setAttendance] = useState({});
  const [payroll, setPayroll] = useState({});
  const [performance, setPerformance] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    used_leave: 0,
    balance_leave: 0,
  });

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [longestStreak, setLongestStreak] = useState(0);

  const [today, setToday] = useState("");

  const OFFICE_COORDS = {
    latitude: 18.967787,
    longitude: 72.826478,
  };

  const ALLOWED_RADIUS = 10000;

  const [clockingIn, setClockingIn] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const DEVELOPMENT_MODE = true;
  const [workingHoursDisplay, setWorkingHoursDisplay] = useState("0h 0m");
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [mode, setMode] = useState("clockin");
  const [userId, setUserId] = useState(null);
  const [shiftTiming, setShiftTiming] = useState(null);

  const loadData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [prof, att, pay, perf, hol, leave, streakRes] = await Promise.all([
      getApi("/api/employee/profile", headers),
      getApi("/api/employee/attendance", headers),
      getApi("/api/employee/payroll", headers),
      getApi("/api/employee/performance", headers),
      getApi("/api/employee/holidays", headers),
      getApi("/api/employee/my/leaves", headers),
      getApi("/api/employee/streak", headers),
    ]);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayAttendance = (att?.data || []).find((item) =>
      item.clock_in?.startsWith(todayStr)
    );

    const today = new Date();
    const currentMonth = today.getMonth(); // 0-based
    const currentYear = today.getFullYear();

    const nextMonth = (currentMonth + 1) % 12;
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const filteredHolidays = (hol?.data || []).filter((h) => {
      const holidayDate = new Date(h.date);
      const month = holidayDate.getMonth();
      const year = holidayDate.getFullYear();
      return (
        (month === currentMonth && year === currentYear) ||
        (month === nextMonth && year === nextMonthYear)
      );
    });
    // Step 1: Extract sorted unique present days
    const attendanceDates = (att?.data || [])
      .map((a) => a.clock_in && a.clock_in.split("T")[0])
      .filter(Boolean)
      .sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    attendanceDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.round(
          (currentDate - prevDate) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      maxStreak = Math.max(maxStreak, currentStreak);
      prevDate = currentDate;
    });

    const longestStreak = streakRes?.longestStreak || 0;
    setLongestStreak(longestStreak);

    setProfile(prof?.data || {});
    setAttendance(todayAttendance || {});
    setAttendanceHistory(att?.data || []);
    setPayroll(pay?.data?.[0] || {});
    setPerformance(perf?.data?.[0] || {});
    setHolidays(filteredHolidays);
    setLeaveSummary({
      used_leave: leave?.used_leave || 0,
      balance_leave: leave?.balance_leave || 0,
    });

    const formatted = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    setToday(formatted);
  };

  useEffect(() => {
    const fetchShiftTiming = async () => {
      try {
        const res = await getApi("/api/employee/shift-timing");
        console.log(res, "shift data here");

        if (res?.data?.shift_start && res?.data?.shift_end) {
          setShiftTiming(res.data);
        } else {
          setShiftTiming({ shift_start: "10:00", shift_end: "19:00" });
        }
      } catch (err) {
        console.error("Failed to fetch shift timing:", err);
      }
    };

    fetchShiftTiming();
  }, []);

  useEffect(() => {
    loadData();
  }, []);
  const notifyManagerLocationDenied = async (req, res) => {
    try {
      await postApi("/attendance/location-denied", {
        userId,
        deniedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to notify manager:", err);
    }
  };

  const handleClockIn = () => {
    setMode("clockin");

    if (!navigator.geolocation) {
      toast.error("Location not supported by your browser");
      return;
    }

    setClockingIn(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const distance = getDistance({ latitude, longitude }, OFFICE_COORDS);
        console.log("Live Location:", latitude, longitude);
        console.log(
          "Office Coords:",
          OFFICE_COORDS.latitude,
          OFFICE_COORDS.longitude
        );
        console.log("Distance:", distance.toFixed(2), "meters");

        if (distance > ALLOWED_RADIUS) {
          toast.error("You're not inside the office premises");
          setClockingIn(false);
          return;
        }

        // Save location for clock-in API call
        setLocationData({ latitude, longitude });

        // Open webcam modal to take photo
        setShowWebcam(true);
      },
      async (error) => {
        console.error("Location error:", error);
        toast.error("Location permission denied");

        await notifyManagerLocationDenied();

        setClockingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoCapture = async (photoData) => {
    try {
      const coords = await getLiveLocation();
      const payload = {
        ...coords,
        location_type: "office",
        photoFile: photoData,
      };

      const endpoint =
        mode === "clockout"
          ? "/api/employee/clock-out"
          : "/api/employee/clock-in";

      const res = await postApi(endpoint, payload);
      toast.success(res.message);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setClockingIn(false);
      setShowWebcam(false);
    }
  };

  useEffect(() => {
    if (!attendance?.clock_in) return;

    const updateWorkingTime = () => {
      const clockInTime = new Date(attendance.clock_in);
      const clockOutTime = attendance.clock_out
        ? new Date(attendance.clock_out)
        : new Date();

      const diffMs = clockOutTime - clockInTime;
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setWorkingHoursDisplay(`${hours}h ${mins}m`);
    };

    updateWorkingTime();

    if (!attendance.clock_out) {
      const interval = setInterval(updateWorkingTime, 60000);
      return () => clearInterval(interval);
    }
  }, [attendance]);

  const handleClockOut = () => {
    setMode("clockout");
    setShowWebcam(true);
  };

  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  const generateIdCard = async (userId) => {
    try {
      const response = await getRaw(`/api/employee/generate-id-card/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate ID card");
      }

      alert(" ID Card Generated Successfully!");
    } catch (error) {
      alert(error.message || " Generation failed.");
    }
  };

  const downloadIdCard = async () => {
    try {
      const response = await getRaw("/api/employee/id-card");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to download ID card.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "ID_Card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || "Download failed.");
    }
  };

  if (!userId) return null;

  return (
    <EmployeeLayout>
      <div className="space-y-6 bg-gradient-to-br from-black via-gray-900 to-white p-4 rounded-xl">
        <div className="relative w-full bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Greeting & Date */}
            <div>
              <h2 className="flex items-center text-lg sm:text-xl font-semibold text-gray-800">
                <User className="w-5 h-5 mr-2 text-indigo-500" />
                Good {getGreeting()}, {profile.first_name}
              </h2>
              <p className="flex items-center text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                {today}
              </p>
            </div>
            {shiftTiming && (
              <div className="text-sm text-gray-700 mt-2 border border-indigo-100 rounded-md p-3 bg-indigo-50 w-fit">
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>
                    <strong>Shift:</strong> {shiftTiming.shift_start} –{" "}
                    {shiftTiming.shift_end}
                  </span>
                </p>
                {shiftTiming.effective_from &&
                  !isNaN(new Date(shiftTiming.effective_from)) && (
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      (Effective from{" "}
                      {new Date(shiftTiming.effective_from).toLocaleDateString(
                        "en-IN"
                      )}
                      )
                    </p>
                  )}
              </div>
            )}

            {/* Attendance Info or Button */}
            {attendance && attendance.clock_in ? (
              <div className="flex flex-col md:items-end text-sm">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <AlarmClock className="w-4 h-4" />
                  <span>
                    Clocked in at{" "}
                    {new Date(attendance.clock_in).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Late message if after 10:00 AM */}
                {(() => {
                  const clockInTime = new Date(attendance.clock_in);
                  const tenAM = new Date(clockInTime);
                  tenAM.setHours(10, 0, 0, 0);

                  if (clockInTime > tenAM) {
                    const diffMs = clockInTime - tenAM;
                    const diffMinutes = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;

                    return (
                      <div className="flex items-center text-red-600 mt-1 font-medium">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        You are late by{" "}
                        {hours > 0 && `${hours} hour${hours > 1 ? "s" : ""} `}
                        {minutes > 0 &&
                          `${minutes} minute${minutes > 1 ? "s" : ""}`}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="text-gray-700 mt-1">
                  ⏱ Working Time:{" "}
                  <span className="font-semibold text-gray-900">
                    {workingHoursDisplay}
                  </span>
                </div>

                {!attendance.clock_out && (
                  <button
                    onClick={handleClockOut}
                    className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Clock Out
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={clockingIn}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                {clockingIn ? "Checking..." : "Clock In Now"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card
            title="Leaves Left"
            value={`${leaveSummary.balance_leave} days`}
          />
          <Card title="Used Leaves" value={`${leaveSummary.used_leave} days`} />
          <Card
            title="Longest Streak"
            value={
              <div className="flex justify-center items-center gap-2 text-orange-600 font-semibold">
                {longestStreak > 1 && <Flame className="w-4 h-4" />}
                {longestStreak} day{longestStreak > 1 ? "s" : ""}
              </div>
            }
          />

          <Card
            title="Rating"
            value={performance.score ? `${performance.score} out of 10` : "N/A"}
          />
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Attendance Today
          </div>
          {attendance?.clock_in ? (
            <div className="text-blue-600 font-medium">
              <BadgeCheck className="inline-block w-4 h-4 text-green-600 mr-1" />
              Clocked In at {new Date(attendance.clock_in).toLocaleTimeString()}
              {attendance.clock_out && (
                <>
                  {" | "}
                  <LogOut className="inline-block w-4 h-4 text-red-600 mr-1" />
                  Clocked Out at{" "}
                  {new Date(attendance.clock_out).toLocaleTimeString()}
                </>
              )}
            </div>
          ) : (
            <div className="text-red-600 font-medium">
              <LogIn className="inline-block w-4 h-4 mr-1" />
              Not Clocked In Yet
            </div>
          )}

          {/* Previous 5 Days */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 font-medium mb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Previous 5 Days
            </div>
            <ul className="space-y-2 text-sm">
              {attendanceHistory?.slice(1, 6).map((item) => (
                <li
                  key={item.id}
                  className="border border-gray-100 rounded-md px-3 py-2 bg-gray-50 flex justify-between items-center"
                >
                  <strong>
                    {new Date(item.clock_in).toLocaleDateString("en-IN", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                  <div className="text-gray-700">
                    In:{" "}
                    {item.clock_in
                      ? new Date(item.clock_in).toLocaleTimeString()
                      : "—"}{" "}
                    | Out:{" "}
                    {item.clock_out
                      ? new Date(item.clock_out).toLocaleTimeString()
                      : "—"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {performance.comment && (
          <div className="bg-white shadow rounded-xl p-4">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Last Performance Comment
            </div>
            <div className="text-gray-800 font-medium mt-1">
              {performance.comment}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow rounded-xl p-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Badge className="w-4 h-4" />
              Digital ID Card
            </div>
            <div className="text-gray-800 font-medium">
              Generate & Download your ID
            </div>
          </div>

          <div className="flex gap-4">
            <button
              className="text-sm text-green-600 underline cursor-pointer"
              onClick={() => generateIdCard(userId)}
            >
              Generate
            </button>

            <button
              className="text-sm text-blue-600 underline cursor-pointer"
              onClick={downloadIdCard}
            >
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
          <QuickLink
            label="Profile"
            href="/employee/profile"
            icon={<UserCircle />}
          />
          <QuickLink
            label="Apply Leave"
            href="/employee/leaves"
            icon={<ClipboardCheck />}
          />
          <QuickLink
            label="Payslip"
            href="/employee/payroll"
            icon={<Wallet />}
          />
          <QuickLink
            label="Expense"
            href="/employee/expenses"
            icon={<FileText />}
          />
          <QuickLink
            label="Directory"
            href="/employee/directory"
            icon={<Users />}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-white" />
            Upcoming Holidays
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {holidays.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-indigo-100 rounded-full">
                  <CalendarCheck2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-indigo-700">
                    {new Date(h.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-gray-600">{h.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-right mt-4">
          <a
            href="/employee/directory"
            className="text-sm mb-5 text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
            View Employee Directory
          </a>
        </div>
        <div>
          <WebcamModal
            isOpen={showWebcam}
            onClose={() => {
              setShowWebcam(false);
              setClockingIn(false);
            }}
            mode={mode}
            onCapture={handlePhotoCapture}
          />
        </div>
      </div>
    </EmployeeLayout>
  );
}

// Components
function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-bold text-blue-600">{value}</div>
    </div>
  );
}

function QuickLink({ label, href, icon }) {
  return (
    <a
      href={href}
      className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex flex-col items-center py-3 rounded-xl hover:scale-105 transition"
    >
      <span className="mb-1">{icon}</span>
      {label}
    </a>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}
