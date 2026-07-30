"use client";

import { useState, useMemo } from "react";

export interface Option {
  id: string;
  name: string;
}

export interface OptionGroup {
  groupName: string;
  options: Option[];
}

export interface CasteGroup {
  religionId: string;
  religionName: string;
  castes: Option[];
}

// ---------- MultiSelect (plain list) ----------
export function MultiSelect({
  label,
  options = [], // Default to empty array
  selected = [], // Default to empty array
  onChange,
  placeholder = "Select...",
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  options?: Option[];
  selected?: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    // Ensure options is an array before filtering
    if (!Array.isArray(options)) return [];
    return options.filter((opt) => 
      opt && opt.name && opt.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (id: string) => {
    if (!selected) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selected) return;
    onChange(selected.filter((s) => s !== id));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full rounded-2xl border px-4 py-3 cursor-pointer ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {(!selected || selected.length === 0) && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected && selected.map((id) => {
            const opt = options?.find((o) => o && o.id === id);
            return opt ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={(e) => removeTag(id, e)}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-1">
              {filteredOptions.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected?.includes(opt.id) || false}
                    onChange={() => toggleOption(opt.id)}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                </label>
              ))}
              {filteredOptions.length === 0 && (
                <p className="text-center text-gray-500 py-4">No options found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- GroupedMultiSelect ----------
export function GroupedMultiSelect({
  label,
  groups = [], // Default to empty array
  selected = [], // Default to empty array
  onChange,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  groups?: OptionGroup[];
  selected?: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (id: string) => {
    if (!selected) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selected) return;
    onChange(selected.filter((s) => s !== id));
  };

  const isGroupAllSelected = (group: OptionGroup) => {
    if (!group || !group.options || !selected) return false;
    return group.options.every((opt) => selected.includes(opt.id));
  };

  const toggleGroupAll = (group: OptionGroup) => {
    if (!group || !group.options || !selected) return;
    const groupIds = group.options.map((o) => o.id);
    const allSelected = isGroupAllSelected(group);
    if (allSelected) {
      onChange(selected.filter((id) => !groupIds.includes(id)));
    } else {
      const toAdd = groupIds.filter((id) => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];
    return groups
      .filter(group => group && group.options && Array.isArray(group.options))
      .map((group) => ({
        ...group,
        filteredOptions: group.options.filter((opt) =>
          opt && opt.name && opt.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g) => g.filteredOptions.length > 0);
  }, [groups, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`w-full rounded-2xl border px-4 py-3 cursor-pointer ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {(!selected || selected.length === 0) && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected && selected.map((id) => {
            let found: Option | undefined;
            for (const g of groups) {
              if (g && g.options) {
                found = g.options.find((o) => o && o.id === id);
                if (found) break;
              }
            }
            return found ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {found.name}
                <button
                  type="button"
                  onClick={(e) => removeTag(id, e)}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.groupName}>
                  <div className="px-3 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    {group.groupName}
                  </div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGroupAllSelected(group)}
                      onChange={() => toggleGroupAll(group)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {group.filteredOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected?.includes(opt.id) || false}
                        onChange={() => toggleOption(opt.id)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- CasteSelector (grouped by religion) ----------
export function CasteSelector({
  label,
  groups = [], // Default to empty array
  selected = [], // Default to empty array
  onChange,
  placeholder = "Select castes...",
  error,
  disabled = false,
}: {
  label: string;
  groups?: CasteGroup[];
  selected?: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (id: string) => {
    if (!selected) return;
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selected) return;
    onChange(selected.filter((s) => s !== id));
  };

  const isGroupAllSelected = (group: CasteGroup) => {
    if (!group || !group.castes || !selected) return false;
    return group.castes.every((c) => selected.includes(c.id));
  };

  const toggleGroupAll = (group: CasteGroup) => {
    if (!group || !group.castes || !selected) return;
    const groupIds = group.castes.map((c) => c.id);
    const allSelected = isGroupAllSelected(group);
    if (allSelected) {
      onChange(selected.filter((id) => !groupIds.includes(id)));
    } else {
      const toAdd = groupIds.filter((id) => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
  };

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];
    return groups
      .filter(group => group && group.castes && Array.isArray(group.castes))
      .map((group) => ({
        ...group,
        filteredCastes: group.castes.filter((opt) =>
          opt && opt.name && opt.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g) => g.filteredCastes.length > 0);
  }, [groups, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div
        className={`w-full rounded-2xl border px-4 py-3 cursor-pointer ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {(!selected || selected.length === 0) && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected && selected.map((id) => {
            let opt: Option | undefined;
            for (const g of groups) {
              if (g && g.castes) {
                const found = g.castes.find((o) => o && o.id === id);
                if (found) {
                  opt = found;
                  break;
                }
              }
            }
            return opt ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={(e) => removeTag(id, e)}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  ×
                </button>
              </span>
            ) : null;
          })}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent"
                placeholder="Search castes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.religionId}>
                  <div className="px-3 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                    {group.religionName}
                  </div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGroupAllSelected(group)}
                      onChange={() => toggleGroupAll(group)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {group.filteredCastes.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected?.includes(opt.id) || false}
                        onChange={() => toggleOption(opt.id)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}