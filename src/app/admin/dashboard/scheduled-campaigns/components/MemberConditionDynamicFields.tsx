"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// ==================== REUSABLE COMPONENTS (copied from Partner Preference) ====================
interface Option {
  id: string;
  name: string;
}

interface CasteGroup {
  religionId: string;
  religionName: string;
  castes: Option[];
}

interface GroupedOption {
  id: string;
  name: string;
}

interface OptionGroup {
  groupName: string;
  options: GroupedOption[];
}

// MultiSelect Component
interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
  error,
  disabled = false,
  required = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
          {selected.length === 0 && <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
          {selected.map((id) => {
            const opt = options.find((o) => o.id === id);
            return opt ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {opt.name}
                <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900 dark:hover:text-purple-100">×</button>
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
                <label key={opt.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                  <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="w-4 h-4 accent-purple-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// GroupedMultiSelect Component
function GroupedMultiSelect({
  label,
  groups,
  selected,
  onChange,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  groups: OptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== id));
  };

  const isGroupAllSelected = (group: OptionGroup) => group.options.every((opt) => selected.includes(opt.id));

  const toggleGroupAll = (group: OptionGroup) => {
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
    return groups
      .map((group) => ({
        ...group,
        filteredOptions: group.options.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase())),
      }))
      .filter((g) => g.filteredOptions.length > 0);
  }, [groups, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`w-full rounded-2xl border px-4 py-3 cursor-pointer flex flex-wrap gap-2 min-h-[2.5rem] items-center ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
        {selected.length === 0 && <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
        {selected.map((id) => {
          let found: GroupedOption | undefined;
          for (const g of groups) {
            found = g.options.find((o) => o.id === id);
            if (found) break;
          }
          return found ? (
            <span key={id} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
              {found.name}
              <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900 dark:hover:text-purple-100">×</button>
            </span>
          ) : null;
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.groupName}>
                  <div className="px-3 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">{group.groupName}</div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isGroupAllSelected(group)} onChange={() => toggleGroupAll(group)} className="w-4 h-4 accent-purple-600" />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {group.filteredOptions.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="w-4 h-4 accent-purple-600" />
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

// CasteSelector Component
function CasteSelector({
  label,
  groups,
  selected,
  onChange,
  placeholder = "Select castes...",
  error,
  disabled = false,
}: {
  label: string;
  groups: CasteGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleOption = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
    setSearch("");
  };

  const removeTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== id));
  };

  const isGroupAllSelected = (group: CasteGroup) => group.castes.every((c) => selected.includes(c.id));

  const toggleGroupAll = (group: CasteGroup) => {
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
    return groups
      .map((group) => ({
        ...group,
        filteredCastes: group.castes.filter((opt) => opt.name.toLowerCase().includes(search.toLowerCase())),
      }))
      .filter((g) => g.filteredCastes.length > 0);
  }, [groups, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className={`w-full rounded-2xl border px-4 py-3 cursor-pointer ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-white dark:bg-gray-900"}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {selected.length === 0 && <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>}
          {selected.map((id) => {
            let opt: Option | undefined;
            for (const g of groups) {
              const found = g.castes.find((o) => o.id === id);
              if (found) {
                opt = found;
                break;
              }
            }
            return opt ? (
              <span key={id} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                {opt.name}
                <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900 dark:hover:text-purple-100">×</button>
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
              <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-transparent" placeholder="Search castes..." value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.religionId}>
                  <div className="px-3 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">{group.religionName}</div>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={isGroupAllSelected(group)} onChange={() => toggleGroupAll(group)} className="w-4 h-4 accent-purple-600" />
                    <span className="text-sm font-medium">Select All</span>
                  </label>
                  {group.filteredCastes.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
                      <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="w-4 h-4 accent-purple-600" />
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

// ==================== MAIN DYNAMIC FIELDS COMPONENT ====================
interface MemberConditionDynamicFieldsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  religions: Option[];
  countries: Option[];
  casteGroups: CasteGroup[];
  educationGroups: OptionGroup[];
  occupationGroups: OptionGroup[];
  genderOptions: any[];
  onBehalfOptions: any[];
  maritalStatusOptions: Option[];
  deviceTypeOptions: any[];
  planOptions: Option[];
}

export default function MemberConditionDynamicFields({
  formData,
  setFormData,
  errors,
  religions,
  countries,
  casteGroups,
  educationGroups,
  occupationGroups,
  genderOptions,
  onBehalfOptions,
  maritalStatusOptions,
  deviceTypeOptions,
  planOptions,
}: MemberConditionDynamicFieldsProps) {
  const handleMultiChange = (field: string) => (selected: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: selected.map((id) => parseInt(id) || 0),
    }));
  };

  const handleCheckboxToggle = (field: string, value: number) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      const newValues = current.includes(value)
        ? current.filter((v: number) => v !== value)
        : [...current, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleAgeChange = (type: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [`memberAge${type === "min" ? "Min" : "Max"}`]: parseInt(e.target.value) || 0,
    }));
  };

  return (
    <div className="space-y-6">
      {/* === Basic Information === */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <div className="p-6 space-y-6">
          {/* Gender */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Gender</label>
            <div className="flex flex-wrap gap-4">
              {genderOptions.map((option: any) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.gender.includes(option.id)}
                    onChange={() => handleCheckboxToggle("gender", option.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* On Behalf */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">On Behalf</label>
            <div className="flex flex-wrap gap-4">
              {onBehalfOptions.map((option: any) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.onBehalf.includes(option.id)}
                    onChange={() => handleCheckboxToggle("onBehalf", option.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.on_behalf}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Marital Status */}
          <MultiSelect
            label="Marital Status"
            options={maritalStatusOptions}
            selected={formData.maritalStatus.map(String)}
            onChange={handleMultiChange("maritalStatus")}
            placeholder="Select marital status..."
          />

          {/* Age Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Age Range</label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={formData.memberAgeMin || ""}
                onChange={handleAgeChange("min")}
                placeholder="Min"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={formData.memberAgeMax || ""}
                onChange={handleAgeChange("max")}
                placeholder="Max"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            {errors.memberAgeMin && <p className="mt-1 text-sm text-red-600">{errors.memberAgeMin}</p>}
          </div>
        </div>
      </div>

      {/* === Demographics === */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800 p-6">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelect
            label="Religion"
            options={religions}
            selected={formData.religion.map(String)}
            onChange={handleMultiChange("religion")}
            placeholder="Select religions..."
          />

          <CasteSelector
            label="Caste"
            groups={casteGroups}
            selected={formData.caste.map(String)}
            onChange={handleMultiChange("caste")}
            placeholder="Select castes..."
            disabled={formData.religion.length === 0}
          />
        </div>
      </div>

      {/* === Location === */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800 p-6">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MultiSelect
            label="Country"
            options={countries}
            selected={formData.country.map(String)}
            onChange={handleMultiChange("country")}
            placeholder="Select countries..."
          />
          {/* State & City can be added similarly with GroupedMultiSelect if you want */}
        </div>
      </div>

      {/* === Education & Occupation === */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800 p-6">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Education &amp; Occupation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GroupedMultiSelect
            label="Education"
            groups={educationGroups}
            selected={formData.education.map(String)}
            onChange={handleMultiChange("education")}
            placeholder="Select education..."
          />

          <GroupedMultiSelect
            label="Occupation"
            groups={occupationGroups}
            selected={formData.occupation.map(String)}
            onChange={handleMultiChange("occupation")}
            placeholder="Select occupation..."
          />
        </div>
      </div>

      {/* === Device & Plan === */}
      <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Device Type</label>
            <div className="flex flex-wrap gap-4">
              {deviceTypeOptions.map((opt: any) => (
                <label key={opt.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.memberDeviceType.includes(opt.id)}
                    onChange={() => handleCheckboxToggle("memberDeviceType", opt.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opt.deviceName}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plan Purchased */}
          <MultiSelect
            label="Plan Purchased"
            options={planOptions}
            selected={formData.planPurchased.map(String)}
            onChange={handleMultiChange("planPurchased")}
            placeholder="Select plans..."
          />
        </div>
      </div>
    </div>
  );
}