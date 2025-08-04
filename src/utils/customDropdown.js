import { Listbox } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

function SelectDropdown({ label, value, options, onChange, displayKey }) {
  const selected = options.find((opt) => opt.id === value);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer border border-gray-300 rounded-lg bg-white py-2 pl-4 pr-10 text-left shadow-sm text-sm">
            <span className="block truncate">
              {selected ? selected[displayKey] : `Select ${label}`}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto border border-gray-200">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option.id}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 pl-4 pr-4 ${
                    active ? "bg-indigo-100 text-indigo-900" : "text-gray-900"
                  }`
                }
              >
                {option[displayKey]}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
export default SelectDropdown;
