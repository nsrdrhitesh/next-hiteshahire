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
  name?: string; // if your Select uses .name instead of .label
}

interface Option {
  id: string;
  name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ReligionItem {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  isActive: number;
}

interface CasteItem {
  id: string;
  name: string;
  // add more fields if needed
}

type FormData = {
  religionId: string;
  religionName: string;
  casteId: string;
  casteName: string;
  subCasteId: string;
  subCasteName: string;
  subSubCasteId: string;
  subSubCasteName: string;
  motherTongueId: string;
  motherTongueName: string;
};

const initialFormData: FormData = {
  religionId: "",
  religionName: "",
  casteId: "",
  casteName: "",
  subCasteId: "",
  subCasteName: "",
  subSubCasteId: "",
  subSubCasteName: "",
  motherTongueId: "",
  motherTongueName: "",
};

// API Helpers
// Update the fetchOptions helper to handle the API response correctly
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
    
    const options = items.map((item: any) => ({
      value: String(item.id),
      label: item.name,
      name: item.name,
      code: item.code, // Include code if needed
    }));

    const hasMore = json.data?.meta?.hasNextPage ?? false;

    return { options, hasMore };
  } catch (err) {
    console.warn("Fetch options failed:", err);
    return { options: [], hasMore: false };
  }
};

// Update the API methods to include search parameters
const api = {
  getReligions: (search = "", page = 1) =>
    fetchOptions<ReligionItem>(
      `${API_URL}/member-get/religion?search=${encodeURIComponent(search)}`
    ),

  getMainCastes: (religionId: string, search = "", page = 1) =>
    religionId
      ? fetchOptions<CasteItem>(
          `${API_URL}/member-get/castes/religion/${religionId}/main?search=${encodeURIComponent(search)}`
        )
      : Promise.resolve({ options: [], hasMore: false }),

  getSubCastes: (parentId: string, search = "", page = 1) =>
    parentId
      ? fetchOptions<CasteItem>(
          `${API_URL}/member-get/castes/sub/${parentId}?search=${encodeURIComponent(search)}`
        )
      : Promise.resolve({ options: [], hasMore: false }),

  getSubSubCastes: (parentId: string, search = "", page = 1) =>
    parentId
      ? fetchOptions<CasteItem>(
          `${API_URL}/member-get/castes/sub-sub/${parentId}?search=${encodeURIComponent(search)}`
        )
      : Promise.resolve({ options: [], hasMore: false }),

  getMotherTongue: (search = "", page = 1) =>
    fetchOptions<ReligionItem>(
      `${API_URL}/member-get/language?search=${encodeURIComponent(search)}`
    ),
  
  // New API call to fetch existing profile religion data
  getProfileReligion: (memberId: string) =>
    fetch(`${API_URL}/member-get/profile-religion/${memberId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "API error");
        return json.data?.data;
      })
      .catch((err) => {
        console.warn("Fetch profile religion failed:", err);
        return null;
      }),
};

// Component

export default function RegistrationStep3() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id as string;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [hasSubCastes, setHasSubCastes] = useState(false);
  const [hasSubSubCastes, setHasSubSubCastes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    !!formData.religionId &&
    !!formData.casteId &&
    !!formData.motherTongueId;

  // Fetch existing data if memberId exists
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!memberId) return;
      
      setIsLoading(true);
      try {
        const data = await api.getProfileReligion(memberId);
        
        if (data) {
          // Populate form with existing data
          setFormData({
            religionId: data.religion_id?.toString() || "",
            religionName: "", // Will be populated by SearchableSelect when value is set
            casteId: data.caste_id?.toString() || "",
            casteName: "", // Will be populated by SearchableSelect when value is set
            subCasteId: data.sub_caste_id?.toString() || "",
            subCasteName: "", // Will be populated by SearchableSelect when value is set
            subSubCasteId: data.sub_sub_caste_id?.toString() || "",
            subSubCasteName: "", // Will be populated by SearchableSelect when value is set
            motherTongueId: data.mother_tongue_id?.toString() || "",
            motherTongueName: "", // Will be populated by SearchableSelect when value is set
          });
          
          // Fetch and set religion name
          if (data.religion_id) {
            const religions = await api.getReligions();
            const religion = religions.options.find(r => r.value === data.religion_id.toString());
            if (religion) {
              setFormData(prev => ({ ...prev, religionName: religion.label }));
            }
          }
          
          // Fetch and set caste name
          if (data.religion_id && data.caste_id) {
            const castes = await api.getMainCastes(data.religion_id.toString());
            const caste = castes.options.find(c => c.value === data.caste_id.toString());
            if (caste) {
              setFormData(prev => ({ ...prev, casteName: caste.label }));
            }
          }
          
          // Fetch and set sub caste name if exists
          if (data.caste_id && data.sub_caste_id && data.sub_caste_id !== 0) {
            const subCastes = await api.getSubCastes(data.caste_id.toString());
            const subCaste = subCastes.options.find(sc => sc.value === data.sub_caste_id.toString());
            if (subCaste) {
              setFormData(prev => ({ ...prev, subCasteName: subCaste.label }));
            }
          }
          
          // Fetch and set sub-sub caste name if exists
          if (data.sub_caste_id && data.sub_sub_caste_id && data.sub_sub_caste_id !== 0) {
            const subSubCastes = await api.getSubSubCastes(data.sub_caste_id.toString());
            const subSubCaste = subSubCastes.options.find(ssc => ssc.value === data.sub_sub_caste_id.toString());
            if (subSubCaste) {
              setFormData(prev => ({ ...prev, subSubCasteName: subSubCaste.label }));
            }
          }
          
          // Fetch and set mother tongue name
          if (data.mother_tongue_id) {
            const motherTongues = await api.getMotherTongue();
            const motherTongue = motherTongues.options.find(mt => mt.value === data.mother_tongue_id.toString());
            if (motherTongue) {
              setFormData(prev => ({ ...prev, motherTongueName: motherTongue.label }));
            }
          }
        }
        // If API fails (returns null), we keep the empty form (initialFormData)
      } catch (error) {
        console.error("Error fetching profile religion:", error);
        // Keep empty form, don't show error to user
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [memberId]);

  // Validation 
  const validate = useCallback((name: keyof FormData, value: string) => {
    const field = name.replace(/(Id|Name)$/, "");
    const error = value.trim() ? "" : `Please select ${field}`;
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  // Handlers
  const handleSelectChange = useCallback(
    (field: keyof FormData, nameField: keyof FormData, value: string, option?: Option | null) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        [nameField]: option?.name || "",
      }));
      validate(field, value);
    },
    [validate]
  );

  const resetCascadingFields = useCallback((from: "religion" | "caste" | "subCaste") => {
    setFormData((prev) => ({
      ...prev,
      ...(from === "religion" && {
        casteId: "",
        casteName: "",
        subCasteId: "",
        subCasteName: "",
        subSubCasteId: "",
        subSubCasteName: "",
      }),
      ...(from === "caste" && {
        subCasteId: "",
        subCasteName: "",
        subSubCasteId: "",
        subSubCasteName: "",
      }),
      ...(from === "subCaste" && {
        subSubCasteId: "",
        subSubCasteName: "",
      }),
    }));
  }, []);

  // Cascade checks
  useEffect(() => {
    if (!formData.casteId) {
      setHasSubCastes(false);
      return;
    }

    let active = true;
    api.getSubCastes(formData.casteId).then(({ options }) => {
      if (!active) return;
      setHasSubCastes(options.length > 0);
    });
    return () => {
      active = false;
    };
  }, [formData.casteId]);

  useEffect(() => {
    if (!formData.subCasteId) {
      setHasSubSubCastes(false);
      return;
    }

    let active = true;
    api.getSubSubCastes(formData.subCasteId).then(({ options }) => {
      if (!active) return;
      setHasSubSubCastes(options.length > 0);
    });
    return () => {
      active = false;
    };
  }, [formData.subCasteId]);

  // Submit
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/login");
      return;
    }

    const requiredFields: (keyof FormData)[] = ["religionId", "casteId", "motherTongueId"];
    const allValid = requiredFields.every((f) => validate(f, formData[f]));

    if (!allValid) {
      showError("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    // Flat payload matching your table columns
    const payload = {
      member_id: Number(memberId),
      religion_id: Number(formData.religionId),
      caste_id: formData.casteId ? Number(formData.casteId) : 0,
      sub_caste_id: formData.subCasteId ? Number(formData.subCasteId) : 0,
      sub_sub_caste_id: formData.subSubCasteId ? Number(formData.subSubCasteId) : 0,
      mother_tongue_id: Number(formData.motherTongueId),
    };

    try {
      const response = await fetch(`${API_URL}/member/member-religion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save religion & community details");
      }

      showSuccess("Religion & Community details saved successfully!");

      // Go to next step
      router.push(`/admin/dashboard/members/create/${result.data.member_id}/basic-form`);
    } catch (err: any) {
      console.error("Save error:", err);
      showError(err.message || "Something went wrong while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while fetching existing data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <PageHeader
        title="Religion & Community"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Religion & Community" },
        ]}
        step={{ current: 3, total: 10, description: "Religion & Community" }}
      />

      {/* Progress */}
      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i < 3 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 md:p-10">
          <form onSubmit={handleNext} className="space-y-8">
            <SearchableSelect
              label="Religion"
              value={formData.religionId}
              onChange={(val, opt) => {
                // Now opt contains the full option object with name, code, etc.
                handleSelectChange("religionId", "religionName", val, opt);
                resetCascadingFields("religion");
              }}
              fetchOptions={async (search, page) => {
                const result = await api.getReligions(search, page);
                return {
                  data: result.options.map(opt => ({
                    id: opt.value,
                    name: opt.label,
                    // code: opt.code
                  })),
                  meta: {
                    hasNextPage: result.hasMore,
                    total: 0 // You might want to get this from API response
                  }
                };
              }}
              placeholder="Select religion..."
              required
              error={errors.religionId}
            />

            {formData.religionId && (
              <SearchableSelect
                label="Caste"
                value={formData.casteId}
                onChange={(val, opt) => {
                  handleSelectChange("casteId", "casteName", val, opt);
                  resetCascadingFields("caste");
                }}
                fetchOptions={async (search, page) => {
                  // Pass religionId as the first parameter
                  const result = await api.getMainCastes(formData.religionId, search, page);
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
                placeholder="Select Caste..."
                required
                error={errors.casteId}
                key={formData.religionId} // Add key to force re-render when religion changes
              />
            )}

            {formData.casteId && hasSubCastes && (
              <SearchableSelect
                label="Sub Caste"
                value={formData.subCasteId}
                onChange={(val, opt) => {
                  handleSelectChange("subCasteId", "subCasteName", val, opt); // , opt
                  resetCascadingFields("subCaste");
                }}
                fetchOptions={async (search, page) => {
                  const result = await api.getSubCastes(formData.casteId, search, page);
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
                placeholder="Select Sub Caste (optional)"
                key={formData.casteId} // Add key to force re-render when caste changes
              />
            )}

            {formData.subCasteId && hasSubSubCastes && (
              <SearchableSelect
                label="Sub-Sub Caste"
                value={formData.subSubCasteId}
                onChange={(val, opt) =>
                  handleSelectChange("subSubCasteId", "subSubCasteName", val, opt)
                }
                fetchOptions={async (search, page) => {
                  const result = await api.getSubSubCastes(formData.subCasteId, search, page);
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
                placeholder="Select Sub-Sub Caste (optional)"
                key={formData.subCasteId} // Add key to force re-render when sub-caste changes
              />
            )}

            <SearchableSelect
              label="Mother Tongue"
              value={formData.motherTongueId}
              onChange={(val, opt) => handleSelectChange("motherTongueId", "motherTongueName", val, opt) }
              fetchOptions={async (search, page) => {
                const result = await api.getMotherTongue(search, page);
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
              placeholder="Select Mother Tongue"
              required
              error={errors.motherTongueId}
            />

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              {/* <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Step 2
              </button> */}

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
                {isSubmitting ? "Saving..." : "Continue to Basic Details →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}