"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

// ======================== INTERFACES ========================
interface Option {
  id: string;
  name: string;
}

interface CasteGroup {
  religionId: string;
  religionName: string;
  castes: Option[];
}

// NEW: Sub-caste group keyed by caste
interface SubCasteGroup {
  casteId: string;
  casteName: string;
  subCastes: Option[];
}

interface GroupedOption {
  id: string;
  name: string;
}

interface OptionGroup {
  groupName: string;
  options: GroupedOption[];
}

// ======================== GROUPED MULTI-SELECT ========================
function GroupedMultiSelect({
  label,
  groups,
  selected,
  onChange,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
  minSelect = 0,
}: {
  label: string;
  groups: OptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minSelect?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const isGroupAllSelected = (group: OptionGroup) =>
    group.options.every((opt) => selected.includes(opt.id));

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
        filteredOptions: group.options.filter((opt) =>
          opt.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g) => g.filteredOptions.length > 0);
  }, [groups, search]);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {minSelect > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            (please select at least {minSelect})
          </span>
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
        {selected.map((id) => {
          let found: GroupedOption | undefined;
          for (const g of groups) {
            found = g.options.find((o) => o.id === id);
            if (found) break;
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
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
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
                          checked={selected.includes(opt.id)}
                          onChange={() => toggleOption(opt.id)}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                      </label>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No options found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== MULTI-SELECT COMPONENT ========================
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
          {selected.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected.map((id) => {
            const opt = options.find((o) => o.id === id);
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
                    checked={selected.includes(opt.id)}
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

// ======================== CASTE SELECTOR (grouped by religion) ========================
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

  const isGroupAllSelected = (group: CasteGroup) =>
    group.castes.every((c) => selected.includes(c.id));

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
        filteredCastes: group.castes.filter((opt) =>
          opt.name.toLowerCase().includes(search.toLowerCase())
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
          {selected.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected.map((id) => {
            let opt: Option | undefined;
            for (const g of groups) {
              const found = g.castes.find((o) => o.id === id);
              if (found) { opt = found; break; }
            }
            return opt ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {opt.name}
                <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900 dark:hover:text-purple-100">
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
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
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
                          checked={selected.includes(opt.id)}
                          onChange={() => toggleOption(opt.id)}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{opt.name}</span>
                      </label>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No options found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== SUB-CASTE SELECTOR (grouped by caste) ========================
function SubCasteSelector({
  label,
  groups,
  selected,
  onChange,
  placeholder = "Select sub castes...",
  error,
  disabled = false,
}: {
  label: string;
  groups: SubCasteGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const isGroupAllSelected = (group: SubCasteGroup) =>
    group.subCastes.every((c) => selected.includes(c.id));

  const toggleGroupAll = (group: SubCasteGroup) => {
    const groupIds = group.subCastes.map((c) => c.id);
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
        filteredSubCastes: group.subCastes.filter((opt) =>
          opt.name.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((g) => g.filteredSubCastes.length > 0);
  }, [groups, search]);

  // Total sub-caste count across all groups
  const totalSubCastes = groups.reduce((acc, g) => acc + g.subCastes.length, 0);

  if (totalSubCastes === 0 && !disabled) return null;

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
          {selected.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          {selected.map((id) => {
            let opt: Option | undefined;
            for (const g of groups) {
              const found = g.subCastes.find((o) => o.id === id);
              if (found) { opt = found; break; }
            }
            return opt ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
              >
                {opt.name}
                <button type="button" onClick={(e) => removeTag(id, e)} className="hover:text-purple-900 dark:hover:text-purple-100">
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
                placeholder="Search sub castes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="p-2 space-y-4">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div key={group.casteId}>
                    <div className="px-3 py-2 font-semibold text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-700">
                      {group.casteName}
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
                    {group.filteredSubCastes.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer"
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
              ) : (
                <p className="text-center text-gray-500 py-4">No options found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== API HELPERS ========================
const fetchOptions = async (
  endpoint: string,
  search = ""
): Promise<{ data: Option[]; hasMore: boolean }> => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("API error");

    const items = json.data?.data || [];
    const options = items.map((item: any) => ({
      id: String(item.id || item.countryId || item.stateId || item.cityId),
      name: item.name || item.ft_value || item.name_en || item.country_name || item.state_name || item.city_name || "Unnamed",
    }));

    return {
      data: options,
      hasMore: json.data?.meta?.hasNextPage ?? false,
    };
  } catch (err) {
    console.warn(`Failed to fetch ${endpoint}:`, err);
    return { data: [], hasMore: false };
  }
};

const api = {
  getReligions: (search = "") => fetchOptions("member-get/religion", search),
  getMotherTongues: (search = "") => fetchOptions("member-get/language", search),
  getHeights: (search = "") => fetchOptions("member-get/height", search),
  getMaritalStatuses: (search = "") => fetchOptions("member-get/marital-status", search),
  getEducations: (search = "") => fetchOptions("member-get/education", search),
  getOccupations: (search = "") => fetchOptions("member-get/occupation", search),
  getIncomes: (search = "") => fetchOptions("member-get/annual-income-range", search),
  getWealths: (search = "") => fetchOptions("member-get/wealth", search),
  getCountries: (search = "") => fetchOptions("member-get/countries", search),

  getCastesByReligion: (religionId: string, search = "") =>
    fetchOptions(`member-get/castes/religion/${religionId}/main`, search),

  // NEW: fetch sub-castes for a given caste ID (same pattern as Religion & Community form)
  getSubCastesByCaste: (casteId: string, search = "") =>
    fetchOptions(`member-get/castes/sub/${casteId}`, search),

  getStatesByCountry: (countryId: string, search = "") =>
    fetchOptions(`member-get/states/${countryId}`, search),

  getCitiesByState: (stateId: string, search = "") =>
    fetchOptions(`member-get/cities/${stateId}`, search),
};

// ======================== FORM DATA TYPE ========================
type FormData = {
  religionIds: string[];
  casteIds: string[];
  subCasteIds: string[]; // NEW
  motherTongueIds: string[];
  minAge: string;
  maxAge: string;
  minHeightId: string;
  maxHeightId: string;
  maritalStatusIds: string[];
  minIncomeId: string;
  maxIncomeId: string;
  minWealthId: string;
  maxWealthId: string;
  countryIds: string[];
  stateIds: string[];
  cityIds: string[];
  educationIds: string[];
  occupationIds: string[];
};

const initialFormData: FormData = {
  religionIds: [],
  casteIds: [],
  subCasteIds: [], // NEW
  motherTongueIds: [],
  minAge: "",
  maxAge: "",
  minHeightId: "",
  maxHeightId: "",
  maritalStatusIds: [],
  minIncomeId: "",
  maxIncomeId: "",
  minWealthId: "",
  maxWealthId: "",
  countryIds: [],
  stateIds: [],
  cityIds: [],
  educationIds: [],
  occupationIds: [],
};

const parseJSONArray = (jsonString: string | null | undefined): string[] => {
  if (!jsonString) return [];
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    console.warn("Failed to parse JSON array:", jsonString);
    return [];
  }
};

const ageOptions = Array.from({ length: 53 }, (_, i) => ({
  id: String(18 + i),
  name: String(18 + i),
}));

export default function PartnerPreferenceStep() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Options state
  const [religions, setReligions] = useState<Option[]>([]);
  const [motherTongues, setMotherTongues] = useState<Option[]>([]);
  const [heights, setHeights] = useState<Option[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<Option[]>([]);
  const [educations, setEducations] = useState<Option[]>([]);
  const [occupations, setOccupations] = useState<Option[]>([]);
  const [incomes, setIncomes] = useState<Option[]>([]);
  const [wealths, setWealths] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);

  const [casteGroups, setCasteGroups] = useState<CasteGroup[]>([]);
  // NEW: sub-caste groups keyed by selected caste IDs
  const [subCasteGroups, setSubCasteGroups] = useState<SubCasteGroup[]>([]);

  const [stateGroups, setStateGroups] = useState<OptionGroup[]>([]);
  const [cityGroups, setCityGroups] = useState<OptionGroup[]>([]);
  const [educationGroups, setEducationGroups] = useState<OptionGroup[]>([]);
  const [occupationGroups, setOccupationGroups] = useState<OptionGroup[]>([]);

  // Fetch existing partner preference data
  useEffect(() => {
    const fetchPartnerPreference = async () => {
      if (!memberId) return;
      try {
        const accessToken = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/member-get/partner-preference/${memberId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          console.log("No existing partner preference data found");
          return;
        }
        const result = await response.json();
        if (result.success && result.data?.data) {
          const data = result.data.data;
          setFormData({
            religionIds: parseJSONArray(data.religionIds),
            casteIds: parseJSONArray(data.casteIds),
            subCasteIds: parseJSONArray(data.subCasteIds), // NEW
            motherTongueIds: parseJSONArray(data.motherTongueIds),
            minAge: data.minAge?.toString() || "",
            maxAge: data.maxAge?.toString() || "",
            minHeightId: data.minHeightId?.toString() || "",
            maxHeightId: data.maxHeightId?.toString() || "",
            maritalStatusIds: parseJSONArray(data.maritalStatusIds),
            minIncomeId: data.minIncomeId?.toString() || "",
            maxIncomeId: data.maxIncomeId?.toString() || "",
            minWealthId: data.minWealthId?.toString() || "",
            maxWealthId: data.maxWealthId?.toString() || "",
            countryIds: parseJSONArray(data.countryIds),
            stateIds: parseJSONArray(data.stateIds),
            cityIds: parseJSONArray(data.cityIds),
            educationIds: parseJSONArray(data.educationIds),
            occupationIds: parseJSONArray(data.occupationIds),
          });
        }
      } catch (err) {
        console.log("Error fetching partner preference:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPartnerPreference();
  }, [memberId]);

  // Fetch static lists on mount
  useEffect(() => {
    const fetchAll = async () => {
      const [
        religionsRes, motherTonguesRes, heightsRes, maritalStatusesRes,
        educationsRes, occupationsRes, incomesRes, wealthsRes, countriesRes,
      ] = await Promise.all([
        api.getReligions(), api.getMotherTongues(), api.getHeights(),
        api.getMaritalStatuses(), api.getEducations(), api.getOccupations(),
        api.getIncomes(), api.getWealths(), api.getCountries(),
      ]);
      setReligions(religionsRes.data);
      setMotherTongues(motherTonguesRes.data);
      setHeights(heightsRes.data.sort((a, b) => Number(a.id) - Number(b.id)));
      setMaritalStatuses(maritalStatusesRes.data);
      setEducations(educationsRes.data);
      setOccupations(occupationsRes.data);
      setIncomes(incomesRes.data.sort((a, b) => Number(a.id) - Number(b.id)));
      setWealths(wealthsRes.data.sort((a, b) => Number(a.id) - Number(b.id)));
      setCountries(countriesRes.data);
    };
    fetchAll();
  }, []);

  // Fetch grouped education and occupation
  useEffect(() => {
    const fetchAndGroup = async () => {
      try {
        const eduRes = await fetch(`${API_URL}/member-get/education`);
        const eduJson = await eduRes.json();
        if (eduJson.success) {
          const map = new Map<string, GroupedOption[]>();
          eduJson.data.data.forEach((item: any) => {
            const groupName = item.educationGroup?.name || "Ungrouped / Others";
            if (!map.has(groupName)) map.set(groupName, []);
            map.get(groupName)!.push({ id: String(item.id), name: item.name.trim() });
          });
          const sortedGroups = Array.from(map.entries())
            .map(([groupName, options]) => ({ groupName, options: options.sort((a, b) => a.name.localeCompare(b.name)) }))
            .sort((a, b) => a.groupName.localeCompare(b.groupName));
          setEducationGroups(sortedGroups);
        }

        const occRes = await fetch(`${API_URL}/member-get/occupation`);
        const occJson = await occRes.json();
        if (occJson.success) {
          const map = new Map<string, GroupedOption[]>();
          occJson.data.data.forEach((item: any) => {
            const groupName = item.occupationGroup?.name || "Ungrouped / Others";
            if (!map.has(groupName)) map.set(groupName, []);
            map.get(groupName)!.push({ id: String(item.id), name: item.name.trim() });
          });
          const sortedGroups = Array.from(map.entries())
            .map(([groupName, options]) => ({ groupName, options: options.sort((a, b) => a.name.localeCompare(b.name)) }))
            .sort((a, b) => a.groupName.localeCompare(b.groupName));
          setOccupationGroups(sortedGroups);
        }
      } catch (err) {
        console.error("Failed to load grouped education/occupation:", err);
      }
    };
    fetchAndGroup();
  }, []);

  // Fetch caste groups when religions change
  useEffect(() => {
    const fetchCasteGroups = async () => {
      if (formData.religionIds.length === 0) {
        setCasteGroups([]);
        return;
      }
      const groups = await Promise.all(
        formData.religionIds.map(async (relId) => {
          const fetchRes = await api.getCastesByReligion(relId);
          const relName = religions.find((r) => r.id === relId)?.name || "Unknown";
          return { religionId: relId, religionName: relName, castes: fetchRes.data };
        })
      );
      setCasteGroups(groups);
    };
    fetchCasteGroups();
  }, [formData.religionIds, religions]);

  // NEW: Fetch sub-caste groups when selected castes change
  useEffect(() => {
    const fetchSubCasteGroups = async () => {
      if (formData.casteIds.length === 0) {
        setSubCasteGroups([]);
        // Also clear sub-caste selections since there are no castes
        setFormData((prev) => ({ ...prev, subCasteIds: [] }));
        return;
      }

      const groups = await Promise.all(
        formData.casteIds.map(async (casteId) => {
          const fetchRes = await api.getSubCastesByCaste(casteId);
          // Find caste name from casteGroups
          let casteName = "Unknown";
          for (const cg of casteGroups) {
            const found = cg.castes.find((c) => c.id === casteId);
            if (found) { casteName = found.name; break; }
          }
          return { casteId, casteName, subCastes: fetchRes.data };
        })
      );

      // Only keep groups that actually have sub-castes
      const nonEmptyGroups = groups.filter((g) => g.subCastes.length > 0);
      setSubCasteGroups(nonEmptyGroups);

      // Clean up any selected sub-castes that no longer belong to selected castes
      if (nonEmptyGroups.length > 0) {
        const validSubCasteIds = new Set(nonEmptyGroups.flatMap((g) => g.subCastes.map((sc) => sc.id)));
        setFormData((prev) => ({
          ...prev,
          subCasteIds: prev.subCasteIds.filter((id) => validSubCasteIds.has(id)),
        }));
      } else {
        setFormData((prev) => ({ ...prev, subCasteIds: [] }));
      }
    };

    fetchSubCasteGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.casteIds, casteGroups]);

  // Fetch states when countries change
  useEffect(() => {
    const fetchStates = async () => {
      if (formData.countryIds.length === 0) {
        setStateGroups([]);
        return;
      }
      const groups = await Promise.all(
        formData.countryIds.map(async (countryId) => {
          const res = await api.getStatesByCountry(countryId);
          const countryName = countries.find((c) => c.id === countryId)?.name || "Unknown Country";
          return { groupName: countryName, options: res.data };
        })
      );
      setStateGroups(groups);
    };
    fetchStates();
  }, [formData.countryIds, countries]);

  // Fetch cities when states change
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.stateIds.length === 0) {
        setCityGroups([]);
        return;
      }
      const groups = await Promise.all(
        formData.stateIds.map(async (stateId) => {
          const res = await api.getCitiesByState(stateId);
          const stateName = stateGroups.flatMap((g) => g.options).find((s) => s.id === stateId)?.name || "Unknown State";
          const countryName = stateGroups.find((g) => g.options.some((o) => o.id === stateId))?.groupName || "Unknown Country";
          return { groupName: `${countryName} > ${stateName}`, options: res.data };
        })
      );
      setCityGroups(groups);
    };
    fetchCities();
  }, [formData.stateIds, stateGroups]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (formData.religionIds.length === 0) newErrors.religionIds = "Please select at least one religion";
    if (formData.motherTongueIds.length === 0) newErrors.motherTongueIds = "Please select at least one mother tongue";
    if (!formData.minAge) newErrors.minAge = "Please select minimum age";
    if (!formData.maxAge) newErrors.maxAge = "Please select maximum age";
    if (formData.minAge && formData.maxAge && Number(formData.minAge) > Number(formData.maxAge)) {
      newErrors.maxAge = "Maximum age must be greater than or equal to minimum age";
    }
    if (!formData.minHeightId) newErrors.minHeightId = "Please select minimum height";
    if (!formData.maxHeightId) newErrors.maxHeightId = "Please select maximum height";
    if (formData.minHeightId && formData.maxHeightId && Number(formData.minHeightId) > Number(formData.maxHeightId)) {
      newErrors.maxHeightId = "Maximum height must be greater than or equal to minimum height";
    }
    if (formData.maritalStatusIds.length === 0) newErrors.maritalStatusIds = "Please select at least one marital status";
    if (formData.educationIds.length < 4) newErrors.educationIds = "Please select at least 4 education levels";
    if (formData.occupationIds.length < 4) newErrors.occupationIds = "Please select at least 4 occupations";
    if (!formData.minIncomeId) newErrors.minIncomeId = "Please select minimum income";
    if (!formData.maxIncomeId) newErrors.maxIncomeId = "Please select maximum income";
    if (!formData.minWealthId) newErrors.minWealthId = "Please select minimum wealth";
    if (!formData.maxWealthId) newErrors.maxWealthId = "Please select maximum wealth";
    if (formData.minIncomeId && formData.maxIncomeId && Number(formData.minIncomeId) > Number(formData.maxIncomeId)) {
      newErrors.maxIncomeId = "Maximum income must be greater than or equal to minimum income";
    }
    if (formData.minWealthId && formData.maxWealthId && Number(formData.minWealthId) > Number(formData.maxWealthId)) {
      newErrors.maxWealthId = "Maximum wealth must be greater than or equal to minimum wealth";
    }
    if (formData.countryIds.length === 0) newErrors.countryIds = "Please select at least one country";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handlers
  const handleMultiChange = (field: keyof FormData) => (selected: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: selected }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    if (field === "religionIds") {
      // Reset caste, sub-caste when religions change
      setFormData((prev) => ({ ...prev, [field]: selected, casteIds: [], subCasteIds: [] }));
    }
    if (field === "casteIds") {
      // Reset sub-caste when castes change
      setFormData((prev) => ({ ...prev, [field]: selected, subCasteIds: [] }));
    }
    if (field === "countryIds") {
      setFormData((prev) => ({ ...prev, [field]: selected, stateIds: [], cityIds: [] }));
    }
    if (field === "stateIds") {
      setFormData((prev) => ({ ...prev, [field]: selected, cityIds: [] }));
    }
  };

  const handleRangeChange = (
    minField: keyof FormData,
    maxField: keyof FormData,
    value: string,
    type: "min" | "max"
  ) => {
    setFormData((prev) => {
      const update = { ...prev };
      if (type === "min") {
        (update as any)[minField] = value;
        if (update[maxField] && Number(value) > Number(update[maxField])) {
          (update as any)[maxField] = value;
        }
      } else {
        (update as any)[maxField] = value;
      }
      return update;
    });
    setErrors((prev) => ({ ...prev, [minField]: undefined, [maxField]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError("Please fill in all required fields correctly");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      showError("Please login again");
      return router.push("/login");
    }

    const payload = {
      memberId: Number(memberId),
      religionIds: formData.religionIds.map(Number),
      casteIds: formData.casteIds.map(Number),
      subCasteIds: formData.subCasteIds.map(Number), // NEW
      motherTongueIds: formData.motherTongueIds.map(Number),
      minAge: formData.minAge ? Number(formData.minAge) : null,
      maxAge: formData.maxAge ? Number(formData.maxAge) : null,
      minHeightId: formData.minHeightId ? Number(formData.minHeightId) : null,
      maxHeightId: formData.maxHeightId ? Number(formData.maxHeightId) : null,
      maritalStatusIds: formData.maritalStatusIds.map(Number),
      minIncomeId: formData.minIncomeId ? Number(formData.minIncomeId) : null,
      maxIncomeId: formData.maxIncomeId ? Number(formData.maxIncomeId) : null,
      minWealthId: formData.minWealthId ? Number(formData.minWealthId) : null,
      maxWealthId: formData.maxWealthId ? Number(formData.maxWealthId) : null,
      countryIds: formData.countryIds.map(Number),
      stateIds: formData.stateIds.map(Number),
      cityIds: formData.cityIds.map(Number),
      educationIds: formData.educationIds.map(Number),
      occupationIds: formData.occupationIds.map(Number),
    };

    try {
      const response = await fetch(`${API_URL}/member/partner-preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save partner preferences");
      }

      showSuccess("Partner preferences saved successfully!");
      router.push(`/admin/dashboard/members/create/${params.id}/profile-photo`);
    } catch (err: any) {
      showError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      formData.religionIds.length > 0 &&
      formData.motherTongueIds.length > 0 &&
      formData.minAge !== "" &&
      formData.maxAge !== "" &&
      formData.minHeightId !== "" &&
      formData.maxHeightId !== "" &&
      formData.maritalStatusIds.length > 0 &&
      formData.educationIds.length >= 4 &&
      formData.occupationIds.length >= 4 &&
      formData.minIncomeId !== "" &&
      formData.maxIncomeId !== "" &&
      formData.minWealthId !== "" &&
      formData.maxWealthId !== "" &&
      formData.countryIds.length > 0 &&
      Number(formData.minAge) <= Number(formData.maxAge) &&
      Number(formData.minHeightId) <= Number(formData.maxHeightId) &&
      Number(formData.minIncomeId) <= Number(formData.maxIncomeId) &&
      Number(formData.minWealthId) <= Number(formData.maxWealthId)
    );
  }, [formData]);

  const filteredMaxIncomes = useMemo(() => {
    if (!formData.minIncomeId) return incomes;
    const minIndex = incomes.findIndex((inc) => inc.id === formData.minIncomeId);
    if (minIndex === -1) return incomes;
    return incomes.slice(minIndex);
  }, [incomes, formData.minIncomeId]);

  const filteredMaxWealth = useMemo(() => {
    if (!formData.minWealthId) return wealths;
    const minIndex = wealths.findIndex((w) => w.id === formData.minWealthId);
    if (minIndex === -1) return wealths;
    return wealths.slice(minIndex);
  }, [wealths, formData.minWealthId]);

  const handleBack = () => {
    router.push(`/admin/dashboard/members/create/${params.id}/location-form`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading partner preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Partner Preference"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Partner Preference" },
        ]}
        step={{ current: 7, total: 10, description: "Partner Preference" }}
      />

      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i < 7 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Religion */}
            <MultiSelect
              label="Religion"
              options={religions}
              selected={formData.religionIds}
              onChange={handleMultiChange("religionIds")}
              placeholder="Select religions..."
              required
              error={errors.religionIds}
            />

            {/* Caste — grouped by religion */}
            <CasteSelector
              label="Caste"
              groups={casteGroups}
              selected={formData.casteIds}
              onChange={handleMultiChange("casteIds")}
              placeholder="Select castes..."
              disabled={formData.religionIds.length === 0}
            />

            {/* Sub Caste — grouped by caste, only shown when castes are selected & sub-castes exist */}
            {formData.casteIds.length > 0 && subCasteGroups.length > 0 && (
              <SubCasteSelector
                label="Sub Caste"
                groups={subCasteGroups}
                selected={formData.subCasteIds}
                onChange={handleMultiChange("subCasteIds")}
                placeholder="Select sub castes (optional)..."
                disabled={formData.casteIds.length === 0}
              />
            )}

            {/* Mother Tongue */}
            <MultiSelect
              label="Mother Tongue"
              options={motherTongues}
              selected={formData.motherTongueIds}
              onChange={handleMultiChange("motherTongueIds")}
              placeholder="Select mother tongues..."
              required
              error={errors.motherTongueIds}
            />

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Age <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.minAge}
                  onChange={(e) => handleRangeChange("minAge", "maxAge", e.target.value, "min")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.minAge ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {ageOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.minAge && <p className="mt-1 text-xs text-red-500">{errors.minAge}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Age <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maxAge}
                  onChange={(e) => handleRangeChange("minAge", "maxAge", e.target.value, "max")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.maxAge ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {ageOptions
                    .filter((opt) => !formData.minAge || Number(opt.id) >= Number(formData.minAge))
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                {errors.maxAge && <p className="mt-1 text-xs text-red-500">{errors.maxAge}</p>}
              </div>
            </div>

            {/* Height Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Height <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.minHeightId}
                  onChange={(e) => handleRangeChange("minHeightId", "maxHeightId", e.target.value, "min")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.minHeightId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {heights.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.minHeightId && <p className="mt-1 text-xs text-red-500">{errors.minHeightId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Height <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maxHeightId}
                  onChange={(e) => handleRangeChange("minHeightId", "maxHeightId", e.target.value, "max")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.maxHeightId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {heights
                    .filter((opt) => !formData.minHeightId || Number(opt.id) >= Number(formData.minHeightId))
                    .map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                {errors.maxHeightId && <p className="mt-1 text-xs text-red-500">{errors.maxHeightId}</p>}
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Marital Status <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-6">
                {maritalStatuses.map((status) => (
                  <label key={status.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.maritalStatusIds.includes(status.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleMultiChange("maritalStatusIds")([...formData.maritalStatusIds, status.id]);
                        } else {
                          handleMultiChange("maritalStatusIds")(
                            formData.maritalStatusIds.filter((id) => id !== status.id)
                          );
                        }
                      }}
                      className="w-5 h-5 accent-purple-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{status.name}</span>
                  </label>
                ))}
              </div>
              {errors.maritalStatusIds && (
                <p className="mt-1 text-xs text-red-500">{errors.maritalStatusIds}</p>
              )}
            </div>

            {/* Partner's Education */}
            <GroupedMultiSelect
              label="Partner's Education"
              groups={educationGroups}
              selected={formData.educationIds}
              onChange={handleMultiChange("educationIds")}
              placeholder="Select education..."
              error={errors.educationIds}
              required={true}
              minSelect={4}
            />

            {/* Partner's Occupation */}
            <GroupedMultiSelect
              label="Partner's Occupation"
              groups={occupationGroups}
              selected={formData.occupationIds}
              onChange={handleMultiChange("occupationIds")}
              placeholder="Select occupation..."
              error={errors.occupationIds}
              required={true}
              minSelect={4}
            />

            {/* Income Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Income <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.minIncomeId}
                  onChange={(e) => handleRangeChange("minIncomeId", "maxIncomeId", e.target.value, "min")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.minIncomeId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {incomes.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.minIncomeId && <p className="mt-1 text-xs text-red-500">{errors.minIncomeId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Income <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.maxIncomeId}
                  onChange={(e) => handleRangeChange("minIncomeId", "maxIncomeId", e.target.value, "max")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.maxIncomeId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {filteredMaxIncomes.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.maxIncomeId && <p className="mt-1 text-xs text-red-500">{errors.maxIncomeId}</p>}
              </div>
            </div>

            {/* Wealth Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Min Wealth 
                </label>
                <select
                  value={formData.minWealthId}
                  onChange={(e) => handleRangeChange("minWealthId", "maxWealthId", e.target.value, "min")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.minWealthId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {wealths.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.minWealthId && <p className="mt-1 text-xs text-red-500">{errors.minWealthId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Max Wealth 
                </label>
                <select
                  value={formData.maxWealthId}
                  onChange={(e) => handleRangeChange("minWealthId", "maxWealthId", e.target.value, "max")}
                  className={`w-full rounded-2xl border px-5 py-3.5 bg-white dark:bg-gray-900 ${
                    errors.maxWealthId ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <option value="">Select</option>
                  {filteredMaxWealth.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                {errors.maxWealthId && <p className="mt-1 text-xs text-red-500">{errors.maxWealthId}</p>}
              </div>
            </div>

            {/* Country */}
            <MultiSelect
              label="Country"
              options={countries}
              selected={formData.countryIds}
              onChange={handleMultiChange("countryIds")}
              placeholder="Select countries..."
              required
              error={errors.countryIds}
            />

            {/* State */}
            <GroupedMultiSelect
              label="State"
              groups={stateGroups}
              selected={formData.stateIds}
              onChange={handleMultiChange("stateIds")}
              placeholder="Select states..."
              disabled={formData.countryIds.length === 0}
            />

            {/* City */}
            <GroupedMultiSelect
              label="City"
              groups={cityGroups}
              selected={formData.cityIds}
              onChange={handleMultiChange("cityIds")}
              placeholder="Select cities..."
              disabled={formData.stateIds.length === 0}
            />

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Location Details
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 rounded-2xl py-4 text-base font-semibold transition-all ${
                  isFormValid && !isSubmitting
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 cursor-pointer"
                    : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700"
                }`}
              >
                {isSubmitting ? "Saving..." : "Continue to Profile Photo →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}