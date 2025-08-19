// AddShiftModal.jsx
import { createPortal } from "react-dom";

export default function AddShiftModal({
  open,
  onClose,
  employees = [],
  form,
  setForm,
  onSubmit,
  saving = false,
}) {
  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* Panel: no vh; inner scroll only */}
      <div
        className="relative w-[min(95vw,520px)] max-h-full overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
          title="Close"
        >
          ✕
        </button>

        <h3 className="mb-4 text-lg font-semibold">Add Shift</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
          className="grid grid-cols-1 gap-4 text-sm"
        >
          {/* Employee dropdown */}
          <div>
            <label className="mb-1 block font-medium">
              Employee <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.employee_id}
              onChange={(e) =>
                setForm((s) => ({ ...s, employee_id: e.target.value }))
              }
              required
            >
              <option value="">-- Select employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} — #{emp.id}
                </option>
              ))}
            </select>
          </div>

          {/* Shift start */}
          <div>
            <label className="mb-1 block font-medium">Shift Start *</label>
            <input
              type="time"
              className="w-full rounded-lg border px-3 py-2"
              value={form.shift_start}
              onChange={(e) =>
                setForm((s) => ({ ...s, shift_start: e.target.value }))
              }
              required
            />
          </div>

          {/* Shift end */}
          <div>
            <label className="mb-1 block font-medium">Shift End *</label>
            <input
              type="time"
              className="w-full rounded-lg border px-3 py-2"
              value={form.shift_end}
              onChange={(e) =>
                setForm((s) => ({ ...s, shift_end: e.target.value }))
              }
              required
            />
          </div>

          {/* Effective from */}
          <div>
            <label className="mb-1 block font-medium">Effective From *</label>
            <input
              type="date"
              className="w-full rounded-lg border px-3 py-2"
              value={form.effective_from}
              onChange={(e) =>
                setForm((s) => ({ ...s, effective_from: e.target.value }))
              }
              required
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
