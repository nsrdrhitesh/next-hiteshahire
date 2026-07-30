"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

interface Option {
  id: string;
  name: string;
  group?: string;
}

interface MultiSelectSearchProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export default function MultiSelectSearch({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  required = false,
  error,
  disabled = false,
}: MultiSelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out options with undefined name and provide fallback
  const validOptions = useMemo(() => {
    return options.filter(opt => opt && opt.id && opt.name).map(opt => ({
      ...opt,
      name: opt.name || `Option ${opt.id}`,
    }));
  }, [options]);

  // Group options by group property if present
  const groupedOptions = useMemo(() => {
    const groups: Record<string, Option[]> = {};
    validOptions.forEach(opt => {
      const group = opt.group || "Ungrouped";
      if (!groups[group]) groups[group] = [];
      groups[group].push(opt);
    });
    return groups;
  }, [validOptions]);

  const filteredGroups = useMemo(() => {
    const result: Record<string, Option[]> = {};
    Object.entries(groupedOptions).forEach(([groupName, opts]) => {
      const filtered = opts.filter(opt => 
        opt.name && opt.name.toLowerCase().includes(search.toLowerCase())
      );
      if (filtered.length) result[groupName] = filtered;
    });
    return result;
  }, [groupedOptions, search]);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== id));
  };

  const getOptionName = (id: string) => {
    const opt = validOptions.find(o => o.id === id);
    return opt?.name || id;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full rounded-xl border bg-white dark:bg-gray-900 cursor-pointer ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 p-3 min-h-[48px]">
          {selected.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            selected.map(id => {
              const name = getOptionName(id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 px-2.5 py-1 rounded-full text-sm"
                >
                  {name}
                  <button
                    type="button"
                    onClick={(e) => removeTag(id, e)}
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="p-2 space-y-3">
            {Object.keys(filteredGroups).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No options found</p>
            ) : (
              Object.entries(filteredGroups).map(([groupName, opts]) => (
                <div key={groupName}>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {groupName}
                  </div>
                  {opts.map(opt => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(opt.id)}
                        onChange={() => toggleOption(opt.id)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                    </label>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}