import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getApi, postApi, deleteApi } from "@/utils/ApiurlHelper";
import { Plus, Trash2 } from "lucide-react";

/** Local YYYY-MM-DD (no timezone surprises) */
const toYMD = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const da = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

function AddHolidayModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate("");
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!date || !title.trim()) return;
    await onCreate({ date, title: title.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-[min(92vw,520px)] rounded-2xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add Holiday</h3>
          <button
            className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Independence Day"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition"
          >
            Create Holiday
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  // fetch
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await getApi("/api/admin/holiday/all");
      const data = Array.isArray(res?.data) ? res.data : [];
      setHolidays(data.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHolidays();
  }, []);

  // quick lookup map for calendar highlighting
  const holidayMap = useMemo(() => {
    const m = new Map();
    holidays.forEach((h) => m.set(h.date, h));
    return m;
  }, [holidays]);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return undefined;
    const key = toYMD(date);
    if (holidayMap.has(key)) return "is-holiday";
    return undefined;
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const key = toYMD(date);
    if (!holidayMap.has(key)) return null;
    return (
      <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-red-500 mx-auto" />
    );
  };

  const onActiveMonthChange = ({ activeStartDate }) => {
    setCurrentMonth(activeStartDate);
  };

  const filtered = holidays.filter((h) => {
    const d = new Date(h.date);
    return (
      d.getMonth() === currentMonth.getMonth() &&
      d.getFullYear() === currentMonth.getFullYear()
    );
  });

  const handleCreate = async ({ date, title }) => {
    try {
      await postApi("/api/admin/holiday", { date, title });
      setShowModal(false);
      await fetchHolidays();
    } catch (e) {
      // 409 duplicate
      if (e?.status === 409 || e?.response?.status === 409) {
        alert("A holiday already exists for that date.");
      } else {
        alert("Failed to create holiday.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this holiday?")) return;
    try {
      await deleteApi(`/api/admin/holiday/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch {
      alert("Failed to delete holiday.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Company Holiday Calendar
          </h2>
          <p className="text-sm text-gray-500">
            Click the + button to add a holiday. Tap a red date dot to see
            details on the right.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white font-semibold shadow hover:shadow-md hover:scale-[1.01] transition"
        >
          <Plus size={18} /> Add Holiday
        </button>
      </div>

      {/* Content: responsive 1 → 2 columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Calendar card */}
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <Calendar
            className="react-calendar-custom w-full"
            calendarType="gregory"
            onActiveStartDateChange={onActiveMonthChange}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 inline-block" />{" "}
              Holiday
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-blue-400 inline-block" />{" "}
              Today
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-200 inline-block" />{" "}
              Weekend
            </span>
          </div>
        </div>

        {/* Month list */}
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <span className="text-sm text-gray-500">
              {filtered.length} holiday{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : filtered.length ? (
            <ul className="space-y-3">
              {filtered.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2"
                >
                  <div>
                    <div className="font-medium text-gray-900">{h.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(h.date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    title="Delete Holiday"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">
              No holidays this month.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddHolidayModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />

      {/* Local styles tuning react-calendar with Tailwind vibes */}
      <style jsx global>{`
        .react-calendar-custom {
          border: none;
          background: transparent;
          font-family: inherit;
        }
        .react-calendar__navigation {
          margin-bottom: 8px;
        }
        .react-calendar__navigation button {
          background: white;
          border: 1px solid #e5e7eb; /* gray-200 */
          padding: 8px 10px;
          border-radius: 10px;
          margin: 2px;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 11px;
          color: #6b7280; /* gray-500 */
          margin-bottom: 4px;
        }
        .react-calendar__tile {
          padding: 8px 2px;
          border-radius: 10px;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #eff6ff; /* blue-50 */
        }
        .react-calendar__tile--now {
          outline: 2px solid #93c5fd; /* blue-300 */
          background: #ffffff;
        }
        .react-calendar__month-view__days__day--weekend {
          background: #f3f4f6; /* gray-100 */
        }
        .is-holiday {
          background: #fee2e2 !important; /* red-100 */
          color: #b91c1c !important; /* red-700 */
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
