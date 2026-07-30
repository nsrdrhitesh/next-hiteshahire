"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ApiMultiSelect } from "../../../../components/ui/ApiMultiSelect";

// ======================== INTERFACES ========================
interface Plan {
  id: number;
  name: string;
}

interface Offer {
  id: number;
  name: string;
}

interface DeviceType {
  id: number;
  deviceCode: string;
  deviceName: string;
}

interface IncomeRange {
  id: number;
  name: string;
}

interface WealthRange {
  id: number;
  net_worth: string;
  name: string;
}

interface Option {
  id: string;
  name: string;
}

interface OptionGroup {
  groupName: string;
  options: Option[];
}

// ======================== COMPONENTS ========================
function DeviceMultiSelect({
  label,
  devices,
  selected,
  onChange,
  placeholder = "Select device types...",
  error,
  disabled = false,
  required = false,
}: {
  label: string;
  devices: DeviceType[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDevices = devices.filter(device =>
    device.deviceName.toLowerCase().includes(search.toLowerCase()) ||
    device.deviceCode.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDevice = (deviceId: number) => {
    if (selected.includes(deviceId)) {
      onChange(selected.filter(id => id !== deviceId));
    } else {
      onChange([...selected, deviceId]);
    }
  };

  const removeTag = (deviceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(id => id !== deviceId));
  };

  const selectAll = () => {
    if (selected.length === devices.length) {
      onChange([]);
    } else {
      onChange(devices.map(d => d.id));
    }
  };

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`w-full rounded-lg border px-4 py-3 cursor-pointer flex flex-wrap gap-2 min-h-[3rem] items-center ${
          error ? "border-red-500" : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-50 dark:bg-gray-700"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        {selected.map((deviceId) => {
          const device = devices.find(d => d.id === deviceId);
          return device ? (
            <span
              key={deviceId}
              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-sm"
            >
              {device.deviceName} ({device.deviceCode})
              <button
                type="button"
                onClick={(e) => removeTag(deviceId, e)}
                className="hover:text-purple-900 dark:hover:text-purple-200"
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
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Search devices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="p-2">
              <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer border-b mb-2 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={selected.length === devices.length && devices.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 accent-purple-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All Devices</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  ({selected.length}/{devices.length})
                </span>
              </label>

              <div className="space-y-1">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <label
                      key={device.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(device.id)}
                        onChange={() => toggleDevice(device.id)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {device.deviceName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Code: {device.deviceCode}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No devices found</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

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
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {label} {required && <span className="text-red-500">*</span>}
        {minSelect > 0 && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            (please select at least {minSelect})
          </span>
        )}
      </label>

      <div
        className={`w-full rounded-lg border px-4 py-3 cursor-pointer flex flex-wrap gap-2 min-h-[3rem] items-center ${
          error ? "border-red-500" : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
        } ${disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "bg-gray-50 dark:bg-gray-700"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
        )}
        {selected.map((id) => {
          let found: Option | undefined;
          for (const g of groups) {
            found = g.options.find((o) => o.id === id);
            if (found) break;
          }
          return found ? (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-sm"
            >
              {found.name}
              <button
                type="button"
                onClick={(e) => removeTag(id, e)}
                className="hover:text-purple-900 dark:hover:text-purple-200"
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
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-auto">
            <div className="p-3 sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGroupAllSelected(group)}
                        onChange={() => toggleGroupAll(group)}
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
                    </label>

                    {group.filteredOptions.map((opt) => (
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
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No options found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== API HELPERS ========================
const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

const fetchOptions = async (endpoint: string): Promise<Option[]> => {
  try {
    const accessToken = localStorage.getItem("access_token");
    const res = await fetch(`${API_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error("API error");

    const items = json.data?.data || [];
    return items.map((item: any) => ({
      id: String(item.id || item.countryId || item.stateId || item.cityId),
      name: item.name || item.country_name || item.state_name || item.city_name || "Unnamed",
    }));
  } catch (err) {
    console.warn(`Failed to fetch ${endpoint}:`, err);
    return [];
  }
};

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return "";
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
};

export default function EditOfferConditionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const platformId = localStorage.getItem("selected_platform_id") || 2;

  const [formData, setFormData] = useState({
    platformId: Number(platformId),
    name: "",
    minAge: null as number | null,
    maxAge: null as number | null,
    gender: [] as number[],
    cityIds: [] as string[],
    stateIds: [] as string[],
    countryIds: [] as string[],
    religionIds: [] as string[],
    casteIds: [] as string[],
    motherTongueIds: [] as string[],
    minAnnualIncomeId: null as number | null,
    maxAnnualIncomeId: null as number | null,
    minWealthId: null as number | null,
    maxWealthId: null as number | null,
    nri: false,
    applicablePlanIds: [] as number[],
    applicableDiscountIds: [] as number[],
    applicableDeviceCodes: [] as number[],
    planStartTimeAfterApproval: null as number | null,
    planEndTimeAfterApproval: null as number | null,
    timespanRegApprovalGt: null as number | null,
    timespanRegApprovalLt: null as number | null,
    planStartDate: "",
    planEndDate: "",
    registrationStartTime: null as number | null,
    registrationEndTime: null as number | null,
    afterApprovalDate: "",
    beforeApprovalDate: "",
    afterRegistrationDate: "",
    beforeRegistrationDate: "",
    conditionShortOrder: 0,
    isActive: true,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [incomeRanges, setIncomeRanges] = useState<IncomeRange[]>([]);
  const [wealthRanges, setWealthRanges] = useState<WealthRange[]>([]);
  
  const [countries, setCountries] = useState<Option[]>([]);
  const [stateGroups, setStateGroups] = useState<OptionGroup[]>([]);
  const [cityGroups, setCityGroups] = useState<OptionGroup[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
    { value: 3, label: "Other" },
  ];

  const api = {
    getCountries: () => fetchOptions("member-get/countries"),
    getStatesByCountry: (countryId: string) => fetchOptions(`member-get/states/${countryId}`),
    getCitiesByState: (stateId: string) => fetchOptions(`member-get/cities/${stateId}`),
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const [plansRes, offersRes, devicesRes, incomeRes, wealthRes, countriesRes] = await Promise.all([
          fetch(`${API_URL}/plans?platformId=${platformId}&limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/plan-offers?platformId=${platformId}&limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/offer-conditions/device-types?platformId=${platformId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/member-get/annual-income-range`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/member-get/wealth`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          api.getCountries(),
        ]);

        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData.data.data);
        }

        if (offersRes.ok) {
          const offersData = await offersRes.json();
          setOffers(offersData.data.data);
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDeviceTypes(devicesData.data.data);
        }

        if (incomeRes.ok) {
          const incomeData = await incomeRes.json();
          setIncomeRanges(incomeData.data.data);
        }

        if (wealthRes.ok) {
          const wealthData = await wealthRes.json();
          setWealthRanges(wealthData.data.data);
        }

        setCountries(countriesRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [platformId]);

  // Fetch condition data for edit mode
  useEffect(() => {
    const fetchCondition = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/offer-conditions/${id}?platformId=${platformId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch condition");
        }

        const result = await response.json();
        
        const countryIds = (result.data.country || []).map(String);
        const stateIds = (result.data.state || []).map(String);
        const cityIds = (result.data.city || []).map(String);

        setFormData({
          platformId: result.data.platformId,
          name: result.data.name,
          minAge: result.data.minAge,
          maxAge: result.data.maxAge,
          gender: result.data.gender || [],
          cityIds: cityIds,
          stateIds: stateIds,
          countryIds: countryIds,
          religionIds: (result.data.religionIds || []).map(String),
          casteIds: (result.data.casteIds || []).map(String),
          motherTongueIds: (result.data.motherTongueIds || []).map(String),
          minAnnualIncomeId: result.data.minAnnualIncome,
          maxAnnualIncomeId: result.data.maxAnnualIncome,
          minWealthId: result.data.minWealth,
          maxWealthId: result.data.maxWealth,
          nri: result.data.nri === 1,
          applicablePlanIds: result.data.applicablePlanIds || [],
          applicableDiscountIds: result.data.applicableDiscountIds || [],
          applicableDeviceCodes: result.data.applicableDeviceCodes || [],
          planStartTimeAfterApproval: result.data.planStartTimeAfterApproval,
          planEndTimeAfterApproval: result.data.planEndTimeAfterApproval,
          timespanRegApprovalGt: result.data.timespanRegApprovalGt,
          timespanRegApprovalLt: result.data.timespanRegApprovalLt,
          planStartDate: formatDateForInput(result.data.planStartDate),
          planEndDate: formatDateForInput(result.data.planEndDate),
          registrationStartTime: result.data.registrationStartTime,
          registrationEndTime: result.data.registrationEndTime,
          afterApprovalDate: formatDateForInput(result.data.afterApprovalDate),
          beforeApprovalDate: formatDateForInput(result.data.beforeApprovalDate),
          afterRegistrationDate: formatDateForInput(result.data.afterRegistrationDate),
          beforeRegistrationDate: formatDateForInput(result.data.beforeRegistrationDate),
          conditionShortOrder: result.data.conditionShortOrder || 0,
          isActive: result.data.isActive === 1,
        });
      } catch (err) {
        setError("Failed to load condition data");
        console.error("Error fetching condition:", err);
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchCondition();
    }
  }, [id, platformId]);

  // Fetch states when countries change
  useEffect(() => {
    const fetchStates = async () => {
      if (formData.countryIds.length === 0) {
        setStateGroups([]);
        return;
      }

      const groups = await Promise.all(
        formData.countryIds.map(async (countryId) => {
          const states = await api.getStatesByCountry(countryId);
          const countryName = countries.find((c) => c.id === countryId)?.name || "Unknown Country";
          return {
            groupName: countryName,
            options: states,
          };
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
          const cities = await api.getCitiesByState(stateId);
          const stateName = stateGroups
            .flatMap((g) => g.options)
            .find((s) => s.id === stateId)?.name || "Unknown State";
          const countryName = stateGroups.find((g) =>
            g.options.some((o) => o.id === stateId)
          )?.groupName || "Unknown Country";
          return {
            groupName: `${countryName} > ${stateName}`,
            options: cities,
          };
        })
      );

      setCityGroups(groups);
    };

    fetchCities();
  }, [formData.stateIds, stateGroups]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? null : parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleMultiSelect = (field: string, value: number) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as number[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleLocationChange = (field: 'countryIds' | 'stateIds' | 'cityIds') => (selected: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: selected }));
    
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    if (field === 'countryIds') {
      setFormData((prev) => ({ ...prev, stateIds: [], cityIds: [] }));
    }
    if (field === 'stateIds') {
      setFormData((prev) => ({ ...prev, cityIds: [] }));
    }
  };

  const handlePlanSelect = (planId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicablePlanIds];
      if (current.includes(planId)) {
        return { ...prev, applicablePlanIds: current.filter((id) => id !== planId) };
      } else {
        return { ...prev, applicablePlanIds: [...current, planId] };
      }
    });
  };

  const handleOfferSelect = (offerId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicableDiscountIds];
      if (current.includes(offerId)) {
        return { ...prev, applicableDiscountIds: current.filter((id) => id !== offerId) };
      } else {
        return { ...prev, applicableDiscountIds: [...current, offerId] };
      }
    });
  };

    // Add these API functions inside the CreateOfferConditionPage component
  const fetchReligions = async (search: string): Promise<Option[]> => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member-get/religion?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch religions");
      const json = await res.json();
      if (!json.success) throw new Error("API error");
      const items = json.data?.data || [];
      return items.map((item: any) => ({
        id: String(item.id),
        name: item.name,
      }));
    } catch (err) {
      console.warn("Failed to fetch religions:", err);
      return [];
    }
  };
  
  const fetchCastes = async (search: string): Promise<Option[]> => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member-get/castes?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch castes");
      const json = await res.json();
      if (!json.success) throw new Error("API error");
      const items = json.data?.data || [];
      return items.map((item: any) => ({
        id: String(item.id),
        name: item.name,
      }));
    } catch (err) {
      console.warn("Failed to fetch castes:", err);
      return [];
    }
  };
  
  const fetchMotherTongues = async (search: string): Promise<Option[]> => {
    try {
      const accessToken = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member-get/language?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch mother tongues");
      const json = await res.json();
      if (!json.success) throw new Error("API error");
      const items = json.data?.data || [];
      return items.map((item: any) => ({
        id: String(item.id),
        name: item.name,
      }));
    } catch (err) {
      console.warn("Failed to fetch mother tongues:", err);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setErrors({ ...errors, name: "Condition name is required" });
      setIsLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const payload = {
        ...formData,
        nri: formData.nri ? 1 : 0,
        isActive: formData.isActive ? 1 : 0,
        countryIds: formData.countryIds.map(Number),
        stateIds: formData.stateIds.map(Number),
        cityIds: formData.cityIds.map(Number),
        religionIds: formData.religionIds.map(Number),
        casteIds: formData.casteIds.map(Number),
        motherTongueIds: formData.motherTongueIds.map(Number),
      };

      const response = await fetch(`${API_URL}/offer-conditions/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));

        if (errData.message && typeof errData.message === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(", ");
            } else if (typeof msgs === "string") {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          setError(errData.message || "Update failed");
        }
        setIsLoading(false);
        return;
      }

      await showSuccess("Offer condition updated successfully");
      router.push("/admin/dashboard/plans-section/offer-conditions");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to update condition");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading condition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "Offer Conditions", href: "/admin/dashboard/plans-section/offer-conditions" },
              { label: "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Offer Condition</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Update condition details and eligibility rules</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/offer-conditions"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="condition-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-70"
          >
            {isLoading ? "Updating..." : "Update Condition"}
          </button>
        </div>
      </div> */}
      <PageHeader
        title="Edit Offer Condition"
        description="Update condition details and eligibility rules"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Plans Section", href: "/admin/dashboard/plans-section" },
          { label: "Offer Conditions", href: "/admin/dashboard/plans-section/offer-conditions" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/plans-section/offer-conditions",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Updating..." : "Update Condition",
            type: "submit",
            form: "condition-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="condition-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Basic Information</h2>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Condition Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="e.g., New User Discount, Festival Offer Eligibility"
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Sort Order</label>
                  <input
                    type="number"
                    name="conditionShortOrder"
                    value={formData.conditionShortOrder}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="isActive"
                      className={`block h-6 w-12 overflow-hidden rounded-full cursor-pointer transition-colors ${
                        formData.isActive ? "bg-gradient-to-r from-purple-600 to-pink-500" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                          formData.isActive ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Religion, Caste, Mother Tongue Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                Religious & Cultural Information
              </h2>

              <div className="space-y-4">
                {/* Religions */}
                <div>
                  <ApiMultiSelect
                    label="Religions"
                    selected={formData.religionIds}
                    onChange={(selected) => {
                      setFormData(prev => ({ ...prev, religionIds: selected }));
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.religionIds;
                        return newErrors;
                      });
                    }}
                    fetchOptions={fetchReligions}
                    placeholder="Select religions..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which religions this condition applies to (leave empty for all)
                  </p>
                </div>
                  
                {/* Castes */}
                <div>
                  <ApiMultiSelect
                    label="Castes"
                    selected={formData.casteIds}
                    onChange={(selected) => {
                      setFormData(prev => ({ ...prev, casteIds: selected }));
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.casteIds;
                        return newErrors;
                      });
                    }}
                    fetchOptions={fetchCastes}
                    placeholder="Select castes..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which castes this condition applies to (leave empty for all)
                  </p>
                </div>
                  
                {/* Mother Tongues */}
                <div>
                  <ApiMultiSelect
                    label="Mother Tongues"
                    selected={formData.motherTongueIds}
                    onChange={(selected) => {
                      setFormData(prev => ({ ...prev, motherTongueIds: selected }));
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.motherTongueIds;
                        return newErrors;
                      });
                    }}
                    fetchOptions={fetchMotherTongues}
                    placeholder="Select mother tongues..."
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which mother tongues this condition applies to (leave empty for all)
                  </p>
                </div>
              </div>
            </div>

            {/* Demographic Information Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Demographic Information</h2>
              
              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Age Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Age</label>
                    <input
                      type="number"
                      name="minAge"
                      value={formData.minAge || ""}
                      onChange={handleChange}
                      min="0"
                      max="120"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 18"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Age</label>
                    <input
                      type="number"
                      name="maxAge"
                      value={formData.maxAge || ""}
                      onChange={handleChange}
                      min="0"
                      max="120"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 35"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Gender</label>
                <div className="flex gap-4">
                  {genderOptions.map((gender) => (
                    <label key={gender.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.gender.includes(gender.value)}
                        onChange={() => handleMultiSelect("gender", gender.value)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{gender.label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Leave empty to apply to all genders</p>
              </div>

              <div>
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Location Restrictions</h3>
                <div className="space-y-4">
                  <div>
                    <GroupedMultiSelect
                      label="Countries"
                      groups={[{ groupName: "All Countries", options: countries }]}
                      selected={formData.countryIds}
                      onChange={handleLocationChange('countryIds')}
                      placeholder="Select countries..."
                    />
                  </div>

                  <div>
                    <GroupedMultiSelect
                      label="States"
                      groups={stateGroups}
                      selected={formData.stateIds}
                      onChange={handleLocationChange('stateIds')}
                      placeholder="Select states..."
                      disabled={formData.countryIds.length === 0}
                    />
                  </div>

                  <div>
                    <GroupedMultiSelect
                      label="Cities"
                      groups={cityGroups}
                      selected={formData.cityIds}
                      onChange={handleLocationChange('cityIds')}
                      placeholder="Select cities..."
                      disabled={formData.stateIds.length === 0}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Leave empty to apply to all locations</p>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Financial Information</h2>
              
              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Annual Income Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Annual Income</label>
                    <select
                      name="minAnnualIncomeId"
                      value={formData.minAnnualIncomeId || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Minimum</option>
                      {incomeRanges.map((range) => (
                        <option key={`min-${range.id}`} value={range.id}>
                          {range.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Annual Income</label>
                    <select
                      name="maxAnnualIncomeId"
                      value={formData.maxAnnualIncomeId || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Maximum</option>
                      {incomeRanges.map((range) => (
                        <option key={`max-${range.id}`} value={range.id}>
                          {range.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Wealth / Net Worth Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Wealth</label>
                    <select
                      name="minWealthId"
                      value={formData.minWealthId || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Minimum</option>
                      {wealthRanges.map((range) => (
                        <option key={`min-${range.id}`} value={range.id}>
                          {range.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Wealth</label>
                    <select
                      name="maxWealthId"
                      value={formData.maxWealthId || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Maximum</option>
                      {wealthRanges.map((range) => (
                        <option key={`max-${range.id}`} value={range.id}>
                          {range.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NRI (Non-Resident Indian)</label>
                <input
                  type="checkbox"
                  name="nri"
                  checked={formData.nri}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Apply this condition only to NRI users</p>
            </div>

            {/* Applicability Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Applicability</h2>
              
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Applicable Plans</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 dark:border-gray-700">
                  {plans.map((plan) => (
                    <label key={plan.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applicablePlanIds.includes(plan.id)}
                        onChange={() => handlePlanSelect(plan.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{plan.name}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Select which plans this condition applies to (leave empty for all plans)</p>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Applicable Offers/Discounts</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 dark:border-gray-700">
                  {offers.map((offer) => (
                    <label key={offer.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.applicableDiscountIds.includes(offer.id)}
                        onChange={() => handleOfferSelect(offer.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{offer.name}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Select which offers this condition applies to</p>
              </div>

              <div className="mb-4">
                <DeviceMultiSelect
                  label="Applicable Device Types"
                  devices={deviceTypes}
                  selected={formData.applicableDeviceCodes}
                  onChange={(selected) => {
                    setFormData(prev => ({ ...prev, applicableDeviceCodes: selected }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.applicableDeviceCodes;
                      return newErrors;
                    });
                  }}
                  placeholder="Select device types..."
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select which device types this condition applies to (leave empty for all devices)
                </p>
              </div>
            </div>

            {/* Timing Rules Section */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Timing Rules</h2>
              
              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Plan Timing Rules</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Start Time (hours after approval)</label>
                    <input
                      type="number"
                      name="planStartTimeAfterApproval"
                      value={formData.planStartTimeAfterApproval || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan End Time (hours after approval)</label>
                    <input
                      type="number"
                      name="planEndTimeAfterApproval"
                      value={formData.planEndTimeAfterApproval || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Registration to Approval Timespan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Greater Than (hours)</label>
                    <input
                      type="number"
                      name="timespanRegApprovalGt"
                      value={formData.timespanRegApprovalGt || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Less Than (hours)</label>
                    <input
                      type="number"
                      name="timespanRegApprovalLt"
                      value={formData.timespanRegApprovalLt || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Date Range Restrictions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Start Date</label>
                    <input
                      type="date"
                      name="planStartDate"
                      value={formData.planStartDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan End Date</label>
                    <input
                      type="date"
                      name="planEndDate"
                      value={formData.planEndDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Registration Time Restrictions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Start Time (hours)</label>
                    <input
                      type="number"
                      name="registrationStartTime"
                      value={formData.registrationStartTime || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Registration End Time (hours)</label>
                    <input
                      type="number"
                      name="registrationEndTime"
                      value={formData.registrationEndTime || ""}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Hours"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Approval & Registration Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">After Approval Date</label>
                    <input
                      type="date"
                      name="afterApprovalDate"
                      value={formData.afterApprovalDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Before Approval Date</label>
                    <input
                      type="date"
                      name="beforeApprovalDate"
                      value={formData.beforeApprovalDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">After Registration Date</label>
                    <input
                      type="date"
                      name="afterRegistrationDate"
                      value={formData.afterRegistrationDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Before Registration Date</label>
                    <input
                      type="date"
                      name="beforeRegistrationDate"
                      value={formData.beforeRegistrationDate}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Condition Information</h3>
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">About Offer Conditions</h4>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <p>Offer conditions define eligibility rules:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Demographic filters (age, gender, location)</li>
                      <li>Financial criteria (income, wealth, NRI status)</li>
                      <li>Applicable plans, offers, and devices</li>
                      <li>Timing rules and date restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/dashboard/plans-section/offer-conditions"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}