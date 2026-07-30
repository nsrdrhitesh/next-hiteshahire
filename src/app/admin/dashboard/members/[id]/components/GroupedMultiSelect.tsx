"use client";

import { useState, useMemo } from "react";

interface GroupedOption {
  id: string;
  name: string;
}

interface OptionGroup {
  groupName: string;
  options: GroupedOption[];
}

interface GroupedMultiSelectProps {
  label: string;
  groups: OptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minSelect?: number;
}

export default function GroupedMultiSelect({
  label,
  groups,
  selected,
  onChange,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
  minSelect = 0,
}: GroupedMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(s => s !== id));
  };

  const isGroupAllSelected = (group: OptionGroup) =>
    group.options.every(opt => selected.includes(opt.id));

  const toggleGroupAll = (group: OptionGroup) => {
    const groupIds = group.options.map(o => o.id);
    const allSelected = isGroupAllSelected(group);
    if (allSelected) {
      onChange(selected.filter(id => !groupIds.includes(id)));
    } else {
      const toAdd = groupIds.filter(id => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map(group => ({
        ...group,
        filteredOptions: group.options.filter(opt =>
          opt.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter(g => g.filteredOptions.length > 0);
  }, [groups, search]);

  const getOptionName = (id: string) => {
    for (const group of groups) {
      const opt = group.options.find(o => o.id === id);
      if (opt) return opt.name;
    }
    return id;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {minSelect > 0 && (
          <span className="text-xs text-gray-500 ml-2">(select at least {minSelect})</span>
        )}
      </label>

      <div
        className={`w-full rounded-2xl border px-4 py-3 cursor-pointer flex flex-wrap gap-2 min-h-[2.5rem] items-center ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        {selected.map(id => (
          <span
            key={id}
            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
          >
            {getOptionName(id)}
            <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900">×</button>
          </span>
        ))}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b">
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-xl"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.map(group => (
                <div key={group.groupName}>
                  <div className="px-3 py-2 font-semibold text-sm border-b">{group.groupName}</div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" checked={isGroupAllSelected(group)} onChange={() => toggleGroupAll(group)} className="accent-purple-600" />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {group.filteredOptions.map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="accent-purple-600" />
                      <span className="text-sm">{opt.name}</span>
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