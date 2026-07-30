"use client";

import { ArrowLeft } from "lucide-react";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import {
  MultiSelect,
  GroupedMultiSelect,
  CasteSelector,
  Option,
  OptionGroup,
  CasteGroup,
} from "../../../components/ui/multi-select";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

// Helper to extract options from API response with null safety
const getOptionsFromResponse = (data: any[]): Option[] => {
  if (!Array.isArray(data)) return [];
  return data
    .filter(item => item && (item.id || item.countryId || item.stateId || item.religionId))
    .map((item) => ({
      id: String(item.id || item.countryId || item.stateId || item.religionId),
      name: item.name || item.country_name || item.state_name || item.ft_value || item.name_en || "Unnamed",
    }));
};

export default function EditPlatformPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
    religion_ids: [] as string[],
    caste_ids: [] as string[],
    country_ids: [] as string[],
    state_ids: [] as string[],
    mother_tongue_ids: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown data
  const [religions, setReligions] = useState<Option[]>([]);
  const [motherTongues, setMotherTongues] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [casteGroups, setCasteGroups] = useState<CasteGroup[]>([]);
  const [stateGroups, setStateGroups] = useState<OptionGroup[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);

  // Helper function to clear error for a field
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Fetch platform data
  const fetchPlatform = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/platforms/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch platform");
      }

      const result = await response.json();
      console.log("Platform data:", result.data);

      setFormData({
        name: result.data.name,
        code: result.data.code,
        description: result.data.description || "",
        is_active: result.data.is_active === true || result.data.is_active === 1, // Convert to boolean
        religion_ids: result.data.religionIds?.map(String) || result.data.religion_ids?.map(String) || [],
        caste_ids: result.data.casteIds?.map(String) || result.data.caste_ids?.map(String) || [],
        country_ids: result.data.countryIds?.map(String) || result.data.country_ids?.map(String) || [],
        state_ids: result.data.stateIds?.map(String) || result.data.state_ids?.map(String) || [],
        mother_tongue_ids: result.data.motherTongueIds?.map(String) || result.data.mother_tongue_ids?.map(String) || [],
      });
    } catch (err) {
      console.error("Error fetching platform:", err);
      setError("Failed to load platform data");
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch all static option lists
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          router.push("/login");
          return;
        }
        
        const headers = { Authorization: `Bearer ${accessToken}` };

        const [religionsRes, motherTonguesRes, countriesRes] = await Promise.all([
          fetch(`${API_URL}/member-get/religion`, { headers }).then((r) => r.json()),
          fetch(`${API_URL}/member-get/language`, { headers }).then((r) => r.json()),
          fetch(`${API_URL}/member-get/countries`, { headers }).then((r) => r.json()),
        ]);

        // Handle religions
        if (religionsRes.success && religionsRes.data?.data) {
          setReligions(getOptionsFromResponse(religionsRes.data.data));
        }

        // Handle mother tongues
        if (motherTonguesRes.success && motherTonguesRes.data?.data) {
          setMotherTongues(getOptionsFromResponse(motherTonguesRes.data.data));
        }

        // Handle countries
        if (countriesRes.success && countriesRes.data?.data) {
          const countryOptions = countriesRes.data.data.map((item: any) => ({
            id: String(item.countryId),
            name: item.country_name,
          }));
          setCountries(countryOptions);
        }
      } catch (err) {
        console.error("Failed to load options", err);
        setError("Failed to load form data. Please refresh the page.");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [router]);

  // Fetch castes for selected religions
  useEffect(() => {
    const fetchCasteGroups = async () => {
      if (formData.religion_ids.length === 0) {
        setCasteGroups([]);
        return;
      }
      
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;
        
        const groups = await Promise.all(
          formData.religion_ids.map(async (relId) => {
            const relName = religions.find((r) => r.id === relId)?.name || "Unknown";
            const response = await fetch(
              `${API_URL}/member-get/castes/religion/${relId}/main`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const json = await response.json();
            const castes = json.success && json.data?.data ? getOptionsFromResponse(json.data.data) : [];
            return { religionId: relId, religionName: relName, castes };
          })
        );
        setCasteGroups(groups);

        // Remove any caste selections that no longer belong to selected religions
        const validCasteIds = groups.flatMap((g) => g.castes.map((c) => c.id));
        setFormData((prev) => ({
          ...prev,
          caste_ids: prev.caste_ids.filter((id) => validCasteIds.includes(id)),
        }));
      } catch (err) {
        console.error("Failed to fetch caste groups", err);
      }
    };
    
    if (religions.length > 0 && !isFetching) {
      fetchCasteGroups();
    }
  }, [formData.religion_ids, religions, isFetching]);

  // Fetch states for selected countries
  useEffect(() => {
    const fetchStateGroups = async () => {
      if (formData.country_ids.length === 0) {
        setStateGroups([]);
        return;
      }
      
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;
        
        const groups = await Promise.all(
          formData.country_ids.map(async (countryId) => {
            const countryName = countries.find((c) => c.id === countryId)?.name || "Unknown";
            const response = await fetch(
              `${API_URL}/member-get/states/${countryId}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const json = await response.json();
            
            let states: Option[] = [];
            
            if (json.success && json.data?.data) {
              states = json.data.data.map((item: any) => ({
                id: String(item.stateId || item.id),
                name: item.state_name || item.name,
              }));
            }
            
            return { groupName: countryName, options: states };
          })
        );
        
        setStateGroups(groups);

        // Remove states that no longer belong to selected countries
        const validStateIds = groups.flatMap((g) => g.options.map((s) => s.id));
        setFormData((prev) => ({
          ...prev,
          state_ids: prev.state_ids.filter((id) => validStateIds.includes(id)),
        }));
      } catch (err) {
        console.error("Failed to fetch state groups", err);
      }
    };
    
    if (countries.length > 0 && formData.country_ids.length > 0 && !isFetching) {
      fetchStateGroups();
    }
  }, [formData.country_ids, countries, isFetching]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchPlatform();
    }
  }, [id]);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearError(name);
  };

  const handleMultiChange = (field: keyof typeof formData) => (selected: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: selected }));
    clearError(field);

    // Cascading resets
    if (field === "religion_ids") {
      setFormData((prev) => ({ ...prev, caste_ids: [] }));
      clearError("caste_ids");
    }
    if (field === "country_ids") {
      setFormData((prev) => ({ ...prev, state_ids: [] }));
      clearError("state_ids");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Platform name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active, // Send boolean directly (true/false)
        religion_ids: formData.religion_ids.length > 0 ? formData.religion_ids.map(Number) : [],
        caste_ids: formData.caste_ids.length > 0 ? formData.caste_ids.map(Number) : [],
        country_ids: formData.country_ids.length > 0 ? formData.country_ids.map(Number) : [],
        state_ids: formData.state_ids.length > 0 ? formData.state_ids.map(Number) : [],
        mother_tongue_ids: formData.mother_tongue_ids.length > 0 ? formData.mother_tongue_ids.map(Number) : [],
      };

      console.log("Updating platform with payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/platforms/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Response:", responseData);

      if (!response.ok) {
        if (responseData.message && typeof responseData.message === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(responseData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) fieldErrors[field] = msgs.join(", ");
            else if (typeof msgs === "string") fieldErrors[field] = msgs;
          });
          setErrors(fieldErrors);
        } else {
          setError(responseData.message || "Update failed");
        }
        return;
      }

      await showSuccess("Platform updated successfully");
      router.push("/admin/dashboard/settings/platforms");
      router.refresh();
    } catch (err: any) {
      console.error("Error updating platform:", err);
      setError(err.message || "Failed to update platform");
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    fetchPlatform();
    setErrors({});
  };

  if (isFetching || loadingOptions) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Platform"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Settings', href: '/admin/dashboard/settings' },
          { label: 'Platforms', href: '/admin/dashboard/settings/platforms' },
          { label: 'Edit' },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/settings/platforms",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="platform-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Platform Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter platform name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Platform Code (Read Only) */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Platform Code
              </label>
              <input
                type="text"
                value={formData.code}
                disabled
                className="block w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Platform code cannot be changed.
              </p>
            </div>

            {/* Religions - Optional */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <MultiSelect
                label="Religions (Optional)"
                options={religions}
                selected={formData.religion_ids}
                onChange={handleMultiChange("religion_ids")}
                placeholder="Select religions..."
              />
            </div>

            {/* Castes (grouped by religion) - Optional */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <CasteSelector
                label="Castes (Optional)"
                groups={casteGroups}
                selected={formData.caste_ids}
                onChange={handleMultiChange("caste_ids")}
                placeholder="Select castes..."
                disabled={formData.religion_ids.length === 0}
              />
            </div>

            {/* Mother Tongues - Optional */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <MultiSelect
                label="Mother Tongues (Optional)"
                options={motherTongues}
                selected={formData.mother_tongue_ids}
                onChange={handleMultiChange("mother_tongue_ids")}
                placeholder="Select mother tongues..."
              />
            </div>

            {/* Countries - Optional */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <MultiSelect
                label="Countries (Optional)"
                options={countries}
                selected={formData.country_ids}
                onChange={handleMultiChange("country_ids")}
                placeholder="Select countries..."
              />
            </div>

            {/* States (grouped by country) - Optional */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <GroupedMultiSelect
                label="States (Optional)"
                groups={stateGroups}
                selected={formData.state_ids}
                onChange={handleMultiChange("state_ids")}
                placeholder="Select states..."
                disabled={formData.country_ids.length === 0}
              />
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the purpose and rules of this platform..."
              />
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Platform Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Status
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  form="platform-form"
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
                >
                  {isLoading ? "Updating..." : "Update Platform"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
              </button>
              <Link
                href="/admin/dashboard/settings/platforms"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Platforms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}