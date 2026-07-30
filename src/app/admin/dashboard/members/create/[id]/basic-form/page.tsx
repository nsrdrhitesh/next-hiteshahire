"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import SearchableSelect from '../../../../components/ui/SearchableSelect';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface ApiOption {
  value: string;
  label: string;
  name?: string;
}

interface HaveChildItem {
  id: string;
  name: string;
}

interface NoOfChildItem {
  id: string;
  name: string;
}

interface Option {
  id: string;
  name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    hasNextPage: boolean;
    total: number;
  };
}

interface HeightItem {
  id: string;
  ft_value: string;
  cm_value: number;
  display_name?: string;
}

interface BloodGroupItem {
  id: string;
  name: string;
  code?: string;
}

interface MaritalStatusItem {
  id: string;
  name_en: string;
  name_ar?: string;
  code?: string;
}

interface CityItem {
  id: string;
  name: string;
  city_id?: string;
}

type FormData = {
  heightId: string;
  heightName: string;
  bloodGroupId: string;
  bloodGroupName: string;
  hasDisability: string;
  disabilityDetails: string;
  maritalStatusId: string;
  maritalStatusName: string;
  birthTime: string;
  birthPlaceId: string;
  birthPlaceName: string;
  haveChildId: string;
  haveChildName: string;
  numberOfChildId: string;
  numberOfChildName: string;
};

const initialFormData: FormData = {
  heightId: "",
  heightName: "",
  bloodGroupId: "",
  bloodGroupName: "",
  hasDisability: "no",
  disabilityDetails: "",
  maritalStatusId: "",
  maritalStatusName: "",
  birthTime: "",
  birthPlaceId: "",
  birthPlaceName: "",
  haveChildId: "",
  haveChildName: "",
  numberOfChildId: "",
  numberOfChildName: "",
};

// API Helpers
const fetchOptions = async <T,>(
  url: string
): Promise<{ options: ApiOption[]; hasMore: boolean }> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.message || "API error");

    // Handle the nested data structure
    const items = json.data?.data || json.data || [];
    
    const options = items.map((item: any) => {
      let label = "";
      
      // Handle different response formats
      if (item.ft_value && item.cm_value) {
        // Height format
        label = `${item.ft_value} (${item.cm_value} cm)`;
      } else if (item.name_en) {
        // Marital status format
        label = item.name_en;
      } else if (item.name) {
        // Blood group, city format
        label = item.name;
      } else {
        label = "Unnamed";
      }

      return {
        value: String(item.id ?? item.city_id ?? ""),
        label: label,
        name: label,
      };
    });

    const hasMore = json.data?.meta?.hasNextPage ?? false;

    return { options, hasMore };
  } catch (err) {
    console.warn("Fetch options failed:", err);
    return { options: [], hasMore: false };
  }
};

// API methods
const api = {
  getHeights: (search = "", page = 1) =>
    fetchOptions<HeightItem>(
      `${API_URL}/member-get/height?search=${encodeURIComponent(search)}`
    ),

  getBloodGroups: (search = "", page = 1) =>
    fetchOptions<BloodGroupItem>(
      `${API_URL}/member-get/blood-group?search=${encodeURIComponent(search)}`
    ),

  getMaritalStatuses: (search = "", page = 1) =>
    fetchOptions<MaritalStatusItem>(
      `${API_URL}/member-get/marital-status?search=${encodeURIComponent(search)}`
    ),

  getCities: (search = "", page = 1) =>
    fetchOptions<CityItem>(
      `${API_URL}/member-get/city?search=${encodeURIComponent(search)}`
    ),

  getHaveChilds: (search = "", page = 1) =>
    fetchOptions<HaveChildItem>(
      `${API_URL}/member-get/have-childs?search=${encodeURIComponent(search)}`
    ),

  getNumberOfChilds: (search = "", page = 1) =>
    fetchOptions<NoOfChildItem>(
      `${API_URL}/member-get/no-of-childs?search=${encodeURIComponent(search)}`
    ),
};

// Helper function to fetch personal basic data
const fetchPersonalBasicData = async (memberId: number) => {
  try {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_URL}/member-get/personal-basic/${memberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch data");
    }

    return result.data?.data || null;
  } catch (err) {
    console.warn("Failed to fetch personal basic data:", err);
    return null;
  }
};

export default function RegistrationStep4() {
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing data when params.id exists
  // Fetch existing data when params.id exists
  useEffect(() => {
    const loadExistingData = async () => {
      if (!params.id) {
        setIsLoading(false);
        return;
      }
    
      try {
        const memberId = Number(params.id);
        const existingData = await fetchPersonalBasicData(memberId);
        
        if (existingData) {
          setFormData({
            heightId: existingData.heightId?.toString() || "",
            heightName: "",                    // Will be populated by SearchableSelect if needed
            bloodGroupId: existingData.bloodGroupId?.toString() || "",
            bloodGroupName: "",
            hasDisability: existingData.hasDisability === 1 ? "yes" : "no",
            disabilityDetails: existingData.disabilityDetails || "",
            maritalStatusId: existingData.maritalStatusId?.toString() || "",
            maritalStatusName: "",
            birthTime: existingData.birthTime || "",
            
            // FIXED: Properly set both ID and Name for Birth Place
            birthPlaceId: existingData.birthPlaceId?.toString() || "",
            birthPlaceName: existingData.birthPlaceName || "",   // This is what you wanted
          
            haveChildId: existingData.haveChildId?.toString() || "",
            haveChildName: "",
            numberOfChildId: existingData.numberOfChildId?.toString() || "",
            numberOfChildName: "",
          });
        }
      } catch (err) {
        console.warn("Error loading existing data:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadExistingData();
  }, [params.id]);

  const maritalStatusNeedsChildren = ["2","3","4","5","6"].includes(formData.maritalStatusId);
  const showNumberOfChildren = maritalStatusNeedsChildren && ["2","3"].includes(formData.haveChildId);

  // Form validation
  const isFormValid = 
    !!formData.heightId &&
    !!formData.bloodGroupId &&
    !!formData.maritalStatusId &&
    !!formData.birthTime &&
    !!formData.birthPlaceId &&
    (formData.hasDisability === "no" || formData.disabilityDetails.trim().length >= 5);

  // Validation function
  const validate = useCallback((name: keyof FormData, value: string) => {
    let error = "";

    if (name === "heightId" && !value) error = "Height is required";
    if (name === "bloodGroupId" && !value) error = "Blood Group is required";
    if (name === "maritalStatusId" && !value) error = "Marital Status is required";
    if (name === "birthTime" && !value) error = "Birth Time is required";
    if (name === "birthPlaceId" && !value) error = "Birth Place is required";
    
    if (name === "disabilityDetails" && formData.hasDisability === "yes" && !value.trim()) {
      error = "Please mention disability details";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  }, [formData.hasDisability]);

  const handleBack = () => {
    // 👉 your custom logic here
    console.log("Running back button logic");
    // 👉 then navigate
    router.push(`/admin/dashboard/members/create/${params.id}/religion-form`);
  };

  // Handlers
  const handleSelectChange = useCallback(
    (field: keyof FormData, nameField: keyof FormData, value: string, option?: Option | null) => {

      setFormData((prev) => {

        let updated = {
          ...prev,
          [field]: value,
          [nameField]: option?.name || "",
        };

        if (field === "maritalStatusId") {
          updated.haveChildId = "";
          updated.haveChildName = "";
          updated.numberOfChildId = "";
          updated.numberOfChildName = "";
        }

        if (field === "haveChildId") {
          updated.numberOfChildId = "";
          updated.numberOfChildName = "";
        }

        return updated;
      });

      validate(field, value);
    },
    [validate]
  );

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      disabilityDetails: value === "no" ? "" : prev.disabilityDetails,
    }));
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name as keyof FormData, value);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    // Validate all required fields
    const requiredFields: (keyof FormData)[] = [
      "heightId", 
      "bloodGroupId", 
      "maritalStatusId", 
      "birthTime", 
      "birthPlaceId"
    ];
    
    const allValid = requiredFields.every((f) => validate(f, formData[f]));

    if (!allValid) {
      showError("Please fill all required fields correctly");
      setIsSubmitting(false);
      return;
    }

    // Prepare payload matching your API expectations
    const payload = {
      member_id: Number(params.id),
      height_id: Number(formData.heightId),
      blood_group_id: Number(formData.bloodGroupId),
      marital_status_id: Number(formData.maritalStatusId),
      birth_place_id: Number(formData.birthPlaceId),
      birth_time: formData.birthTime,
      has_disability: formData.hasDisability === "yes" ? 1 : 0,
      disability_details: formData.hasDisability === "yes" ? formData.disabilityDetails : "",
      have_child_id: formData.haveChildId
        ? Number(formData.haveChildId)
        : 0,
      number_of_child_id: formData.numberOfChildId
        ? Number(formData.numberOfChildId)
        : 0,
    };

    try {
      const response = await fetch(`${API_URL}/member/member-personal-basic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save basic details");
      }

      showSuccess("Basic details saved successfully!");
      
      // Navigate to next step
      router.push(`/admin/dashboard/members/create/${params.id}/educational-form`);
      
    } catch (err: any) {
      console.error("Save error:", err);
      showError(err.message || "Something went wrong while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <PageHeader
        title="Basic Details"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Basic Details" },
        ]}
        step={{ current: 4, total: 10, description: "Basic Details" }}
      />

      {/* Progress bar */}
      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i < 4 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Height */}
            <SearchableSelect
              label="Height"
              value={formData.heightId}
              onChange={(val, opt) => handleSelectChange("heightId", "heightName", val, opt)}
              fetchOptions={async (search, page) => {
                const result = await api.getHeights(search, page);
                return {
                  data: result.options.map(opt => ({
                    id: opt.value,
                    name: opt.label,
                  })),
                  meta: {
                    hasNextPage: result.hasMore,
                    total: 0
                  }
                };
              }}
              placeholder="Search or select height..."
              required
              error={errors.heightId}
            />

            {/* Blood Group */}
            <SearchableSelect
              label="Blood Group"
              value={formData.bloodGroupId}
              onChange={(val, opt) => handleSelectChange("bloodGroupId", "bloodGroupName", val, opt)}
              fetchOptions={async (search, page) => {
                const result = await api.getBloodGroups(search, page);
                return {
                  data: result.options.map(opt => ({
                    id: opt.value,
                    name: opt.label,
                  })),
                  meta: {
                    hasNextPage: result.hasMore,
                    total: 0
                  }
                };
              }}
              placeholder="Select blood group..."
              required
              error={errors.bloodGroupId}
            />

            {/* Physical Disability */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Physical Disability <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasDisability"
                    value="no"
                    checked={formData.hasDisability === "no"}
                    onChange={handleRadioChange}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hasDisability"
                    value="yes"
                    checked={formData.hasDisability === "yes"}
                    onChange={handleRadioChange}
                    className="w-4 h-4 accent-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Yes</span>
                </label>
              </div>

              {formData.hasDisability === "yes" && (
                <div className="mt-4">
                  <textarea
                    name="disabilityDetails"
                    value={formData.disabilityDetails}
                    onChange={handleTextChange}
                    placeholder="Please mention disability details..."
                    rows={3}
                    className={`w-full rounded-2xl border px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y min-h-[100px] ${
                      errors.disabilityDetails
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  />
                  {errors.disabilityDetails && (
                    <p className="mt-1 text-xs text-red-500">{errors.disabilityDetails}</p>
                  )}
                </div>
              )}
            </div>

            {/* Marital Status */}
            <SearchableSelect
              label="Marital Status"
              value={formData.maritalStatusId}
              onChange={(val, opt) => handleSelectChange("maritalStatusId", "maritalStatusName", val, opt)}
              fetchOptions={async (search, page) => {
                const result = await api.getMaritalStatuses(search, page);
                return {
                  data: result.options.map(opt => ({
                    id: opt.value,
                    name: opt.label,
                  })),
                  meta: {
                    hasNextPage: result.hasMore,
                    total: 0
                  }
                };
              }}
              placeholder="Select marital status..."
              required
              error={errors.maritalStatusId}
            />

            {maritalStatusNeedsChildren && (
              <SearchableSelect
                label="Have a Childs"
                value={formData.haveChildId}
                onChange={(val, opt) =>
                  handleSelectChange("haveChildId", "haveChildName", val, opt)
                }
                fetchOptions={async (search, page) => {
                  const result = await api.getHaveChilds(search, page);
                  return {
                    data: result.options.map((opt) => ({
                      id: opt.value,
                      name: opt.label,
                    })),
                    meta: {
                      hasNextPage: result.hasMore,
                      total: 0,
                    },
                  };
                }}
                placeholder="Select..."
              />
            )}

            {showNumberOfChildren && (
              <SearchableSelect
                label="Number of Children"
                value={formData.numberOfChildId}
                onChange={(val, opt) =>
                  handleSelectChange(
                    "numberOfChildId",
                    "numberOfChildName",
                    val,
                    opt
                  )
                }
                fetchOptions={async (search, page) => {
                  const result = await api.getNumberOfChilds(search, page);
                  return {
                    data: result.options.map((opt) => ({
                      id: opt.value,
                      name: opt.label,
                    })),
                    meta: {
                      hasNextPage: result.hasMore,
                      total: 0,
                    },
                  };
                }}
                placeholder="Select..."
              />
            )}

            {/* Birth Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Birth Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="birthTime"
                value={formData.birthTime}
                onChange={handleTextChange}
                className={`w-full rounded-2xl border px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.birthTime
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                }`}
              />
              {errors.birthTime && (
                <p className="mt-1 text-xs text-red-500">{errors.birthTime}</p>
              )}
            </div>

            {/* Birth Place */}
            <SearchableSelect
              label="Birth Place"
              value={formData.birthPlaceId}
              initialLabel={formData.birthPlaceName}
              onChange={(val, opt) => handleSelectChange("birthPlaceId", "birthPlaceName", val, opt)}
              fetchOptions={async (search, page) => {
                const result = await api.getCities(search, page);
                return {
                  data: result.options.map(opt => ({
                    id: opt.value,
                    name: opt.label,
                  })),
                  meta: {
                    hasNextPage: result.hasMore,
                    total: 0
                  }
                };
              }}
              placeholder="Select birth place..."
              required
              error={errors.birthPlaceId}
            />

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Religion Details
              </button>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`
                  flex-1 rounded-2xl py-4 text-base font-semibold transition-all
                  ${
                    isFormValid && !isSubmitting
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
                      : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700"
                  }
                `}
              >
                {isSubmitting ? "Saving..." : "Continue to Education Details →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}