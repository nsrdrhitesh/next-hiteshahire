"use client";

import { useState, useEffect, useMemo } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";
import MultiSelectSearch from "./MultiSelectSearch";
import SearchableSelect from "../../../components/ui/SearchableSelect";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface Option {
  id: string;
  name: string;
  group?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

interface CasteGroup {
  religionId: string;
  religionName: string;
  castes: Option[];
}

// Fetch with error handling and fallback
const fetchOptions = async (endpoint: string): Promise<Option[]> => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    const json = await res.json();
    if (!json.success) return [];
    const items = json.data?.data || [];
    
    return items.map((item: any) => {
      // Handle different API response structures
      let id = '';
      let name = '';
      
      // For countries
      if (item.countryId !== undefined) {
        id = String(item.countryId);
        name = item.country_name || item.name || `Country ${item.countryId}`;
      }
      // For states
      else if (item.stateId !== undefined) {
        id = String(item.stateId);
        name = item.state_name || item.name || `State ${item.stateId}`;
      }
      // For cities
      else if (item.cityId !== undefined) {
        id = String(item.cityId);
        name = item.city_name || item.name || `City ${item.cityId}`;
      }
      // For other endpoints that use 'id' field
      else if (item.id !== undefined) {
        id = String(item.id);
        name = item.name || item.ft_value || item.name_en || `Option ${item.id}`;
      }
      
      return {
        id: id,
        name: name,
        group: item.educationGroup?.name || item.occupationGroup?.name || item.specializationGroup?.name,
      };
    });
  } catch (err) {
    console.warn(`Failed to fetch ${endpoint}:`, err);
    return [];
  }
};

const fetchCastesByReligion = async (religionId: string): Promise<Option[]> => {
  try {
    const res = await fetch(`${API_URL}/member-get/castes/religion/${religionId}/main`);
    const json = await res.json();
    if (!json.success) return [];
    const items = json.data?.data || [];
    
    return items.map((item: any) => ({
      id: String(item.id),
      name: item.name || item.caste_name || `Caste ${item.id}`,
    }));
  } catch (err) {
    console.warn(`Failed to fetch castes for religion ${religionId}:`, err);
    return [];
  }
};

export default function EditPartnerPreferenceModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    religionIds: [] as string[],
    casteIds: [] as string[],
    motherTongueIds: [] as string[],
    manglikStatusId: "",
    minAge: "",
    maxAge: "",
    minHeightId: "",
    maxHeightId: "",
    maritalStatusIds: [] as string[],
    minIncomeId: "",
    maxIncomeId: "",
    minWealthId: "",
    maxWealthId: "",
    countryIds: [] as string[],
    stateIds: [] as string[],
    cityIds: [] as string[],
    educationIds: [] as string[],
    occupationIds: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  // Options state
  const [religions, setReligions] = useState<Option[]>([]);
  const [motherTongues, setMotherTongues] = useState<Option[]>([]);
  const [heights, setHeights] = useState<Option[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<Option[]>([]);
  const [incomes, setIncomes] = useState<Option[]>([]);
  const [wealths, setWealths] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [cities, setCities] = useState<Option[]>([]);
  const [educations, setEducations] = useState<Option[]>([]);
  const [occupations, setOccupations] = useState<Option[]>([]);
  const [casteGroups, setCasteGroups] = useState<CasteGroup[]>([]);

  // Fetch all options once on mount
  useEffect(() => {
    const fetchAll = async () => {
      const [
        rels,
        tongues,
        hts,
        marital,
        incs,
        wths,
        cntrs,
        edus,
        occs,
      ] = await Promise.all([
        fetchOptions("member-get/religion"),
        fetchOptions("member-get/language"),
        fetchOptions("member-get/height"),
        fetchOptions("member-get/marital-status"),
        fetchOptions("member-get/annual-income-range"),
        fetchOptions("member-get/wealth"),
        fetchOptions("member-get/countries"),
        fetchOptions("member-get/education"),
        fetchOptions("member-get/occupation"),
      ]);
      setReligions(rels);
      setMotherTongues(tongues);
      setHeights(hts.sort((a, b) => Number(a.id) - Number(b.id)));
      setMaritalStatuses(marital);
      setIncomes(incs.sort((a, b) => Number(a.id) - Number(b.id)));
      setWealths(wths.sort((a, b) => Number(a.id) - Number(b.id)));
      setCountries(cntrs);
      setEducations(edus);
      setOccupations(occs);
      setOptionsLoaded(true);
    };
    fetchAll();
  }, []);

  // When countries are selected, fetch states for all selected countries
  useEffect(() => {
    if (!optionsLoaded || formData.countryIds.length === 0) {
      setStates([]);
      return;
    }
    const fetchStatesForCountries = async () => {
      const allStates: Option[] = [];
      for (const countryId of formData.countryIds) {
        const statesRes = await fetchOptions(`member-get/states/${countryId}`);
        allStates.push(...statesRes);
      }
      // Remove duplicates by id
      const uniqueStates = Array.from(new Map(allStates.map(s => [s.id, s])).values());
      setStates(uniqueStates);
    };
    fetchStatesForCountries();
  }, [formData.countryIds, optionsLoaded]);

  // When states are selected, fetch cities for all selected states
  useEffect(() => {
    if (!optionsLoaded || formData.stateIds.length === 0) {
      setCities([]);
      return;
    }
    const fetchCitiesForStates = async () => {
      const allCities: Option[] = [];
      for (const stateId of formData.stateIds) {
        const citiesRes = await fetchOptions(`member-get/cities/${stateId}`);
        allCities.push(...citiesRes);
      }
      const uniqueCities = Array.from(new Map(allCities.map(c => [c.id, c])).values());
      setCities(uniqueCities);
    };
    fetchCitiesForStates();
  }, [formData.stateIds, optionsLoaded]);

  // Fetch caste groups when religions change
  useEffect(() => {
  const fetchCasteGroups = async () => {
    if (formData.religionIds.length === 0) {
      setCasteGroups([]);
      return;
    }

    const groups = await Promise.all(
      formData.religionIds.map(async (relId) => {
        const castes = await fetchCastesByReligion(relId);
        const relName = religions.find((r) => r.id === relId)?.name || "Unknown";
        return {
          religionId: relId,
          religionName: relName,
          castes: castes,
        };
      })
    );

    setCasteGroups(groups);
  };

  fetchCasteGroups();
}, [formData.religionIds, religions]);

  // Load existing data from props
  useEffect(() => {
    if (initialData && optionsLoaded) {
      setFormData({
        religionIds: initialData.partner_religion_ids || [],
        casteIds: initialData.partner_caste_ids || [],
        motherTongueIds: initialData.partner_mother_tongue_ids || [],
        manglikStatusId: initialData.manglik_status_id?.toString() || "",
        minAge: initialData.min_age?.toString() || "",
        maxAge: initialData.max_age?.toString() || "",
        minHeightId: initialData.min_height_id?.toString() || "",
        maxHeightId: initialData.max_height_id?.toString() || "",
        maritalStatusIds: initialData.partner_marital_status_ids || [],
        minIncomeId: initialData.min_income_id?.toString() || "",
        maxIncomeId: initialData.max_income_id?.toString() || "",
        minWealthId: initialData.min_wealth_id?.toString() || "",
        maxWealthId: initialData.max_wealth_id?.toString() || "",
        countryIds: initialData.partner_country_ids || [],
        stateIds: initialData.partner_state_ids || [],
        cityIds: initialData.partner_city_ids || [],
        educationIds: initialData.partner_education_ids || [],
        occupationIds: initialData.partner_occupation_ids || [],
      });
    }
  }, [initialData, optionsLoaded]);

  const handleMultiChange = (field: keyof typeof formData, selected: string[]) => {
    setFormData(prev => ({ ...prev, [field]: selected }));
  };

  const fetchManglikStatuses = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/manglik?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  // Flatten caste groups for MultiSelectSearch
  const flatCasteOptions = useMemo(() => {
    return casteGroups.flatMap(group => group.castes);
  }, [casteGroups]);

  const handleRangeChange = (minField: keyof typeof formData, maxField: keyof typeof formData, value: string, type: "min" | "max") => {
    setFormData(prev => {
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
  };

  const ageOptions = Array.from({ length: 53 }, (_, i) => ({ id: String(18 + i), name: String(18 + i) }));

  const filteredMaxIncomes = useMemo(() => {
    if (!formData.minIncomeId) return incomes;
    const minIndex = incomes.findIndex(inc => inc.id === formData.minIncomeId);
    return minIndex === -1 ? incomes : incomes.slice(minIndex);
  }, [incomes, formData.minIncomeId]);

  const filteredMaxWealth = useMemo(() => {
    if (!formData.minWealthId) return wealths;
    const minIndex = wealths.findIndex(w => w.id === formData.minWealthId);
    return minIndex === -1 ? wealths : wealths.slice(minIndex);
  }, [wealths, formData.minWealthId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const payload = {
        memberId: Number(memberId),
        religionIds: formData.religionIds.map(Number),
        casteIds: formData.casteIds.map(Number),
        motherTongueIds: formData.motherTongueIds.map(Number),
        manglikStatusId: formData.manglikStatusId ? Number(formData.manglikStatusId) : null,
        minAge: formData.minAge ? Number(formData.minAge) : null,
        maxAge: formData.maxAge ? Number(formData.maxAge) : null,
        minHeightId: formData.minHeightId ? Number(formData.minHeightId) : null,
        maxHeightId: formData.maxHeightId ? Number(formData.maxHeightId) : null,
        maritalStatusIds: formData.maritalStatusIds.map(Number),
        minIncomeId: formData.minIncomeId ? Number(formData.minIncomeId) : null,
        maxIncomeId: formData.maxIncomeId ? Number(formData.maxIncomeId) : null,
        minWealthId: formData.minWealthId ? Number(formData.minWealthId) : 0,
        maxWealthId: formData.maxWealthId ? Number(formData.maxWealthId) : 0,
        countryIds: formData.countryIds.map(Number),
        stateIds: formData.stateIds.map(Number),
        cityIds: formData.cityIds.map(Number),
        educationIds: formData.educationIds.map(Number),
        occupationIds: formData.occupationIds.map(Number),
      };
      const res = await fetch(`${API_URL}/member/partner-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      showSuccess("Partner preferences updated!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!optionsLoaded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-center">Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal container - remove max-h-[90vh] overflow-auto from here */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full shadow-xl flex flex-col max-h-[90vh]">

        {/* Title remains sticky */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Partner Preference</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelectSearch
              label="Religion"
              options={religions}
              selected={formData.religionIds}
              onChange={(sel) => handleMultiChange("religionIds", sel)}
              required
            />

            <MultiSelectSearch
              label="Caste"
              options={flatCasteOptions}
              selected={formData.casteIds}
              onChange={(sel) => handleMultiChange("casteIds", sel)}
              placeholder="Select castes..."
              required
            />

            <MultiSelectSearch
              label="Mother Tongue"
              options={motherTongues}
              selected={formData.motherTongueIds}
              onChange={(sel) => handleMultiChange("motherTongueIds", sel)}
              required
            />

            <SearchableSelect
              label="Manglik Status"
              value={formData.manglikStatusId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, manglikStatusId: val, manglikStatusName: opt?.name || "" }))}
              fetchOptions={fetchManglikStatuses}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Min Age</label>
              <select
                value={formData.minAge}
                onChange={(e) => handleRangeChange("minAge", "maxAge", e.target.value, "min")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {ageOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Age</label>
              <select
                value={formData.maxAge}
                onChange={(e) => handleRangeChange("minAge", "maxAge", e.target.value, "max")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {ageOptions.filter(opt => !formData.minAge || Number(opt.id) >= Number(formData.minAge)).map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Min Height</label>
              <select
                value={formData.minHeightId}
                onChange={(e) => handleRangeChange("minHeightId", "maxHeightId", e.target.value, "min")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {heights.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Height</label>
              <select
                value={formData.maxHeightId}
                onChange={(e) => handleRangeChange("minHeightId", "maxHeightId", e.target.value, "max")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {heights.filter(h => !formData.minHeightId || Number(h.id) >= Number(formData.minHeightId)).map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <MultiSelectSearch
            label="Marital Status"
            options={maritalStatuses}
            selected={formData.maritalStatusIds}
            onChange={(sel) => handleMultiChange("maritalStatusIds", sel)}
            required
          />

          <MultiSelectSearch
            label="Partner's Education (Min 4)"
            options={educations}
            selected={formData.educationIds}
            onChange={(sel) => handleMultiChange("educationIds", sel)}
            required
          />

          <MultiSelectSearch
            label="Partner's Occupation (Min 4)"
            options={occupations}
            selected={formData.occupationIds}
            onChange={(sel) => handleMultiChange("occupationIds", sel)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Min Income</label>
              <select
                value={formData.minIncomeId}
                onChange={(e) => handleRangeChange("minIncomeId", "maxIncomeId", e.target.value, "min")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {incomes.map(inc => <option key={inc.id} value={inc.id}>{inc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Income</label>
              <select
                value={formData.maxIncomeId}
                onChange={(e) => handleRangeChange("minIncomeId", "maxIncomeId", e.target.value, "max")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
                required
              >
                <option value="">Select</option>
                {filteredMaxIncomes.map(inc => <option key={inc.id} value={inc.id}>{inc.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Min Wealth</label>
              <select
                value={formData.minWealthId}
                onChange={(e) => handleRangeChange("minWealthId", "maxWealthId", e.target.value, "min")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
              >
                <option value="0">Select</option>
                {wealths.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Max Wealth</label>
              <select
                value={formData.maxWealthId}
                onChange={(e) => handleRangeChange("minWealthId", "maxWealthId", e.target.value, "max")}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 bg-white dark:bg-gray-900"
              >
                <option value="0">Select</option>
                {filteredMaxWealth.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <MultiSelectSearch
            label="Preferred Countries"
            options={countries}
            selected={formData.countryIds}
            onChange={(sel) => handleMultiChange("countryIds", sel)}
            required
          />

          <MultiSelectSearch
            label="Preferred States"
            options={states}
            selected={formData.stateIds}
            onChange={(sel) => handleMultiChange("stateIds", sel)}
            disabled={formData.countryIds.length === 0}
          />

          <MultiSelectSearch
            label="Preferred Cities"
            options={cities}
            selected={formData.cityIds}
            onChange={(sel) => handleMultiChange("cityIds", sel)}
            disabled={formData.stateIds.length === 0}
          />

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}