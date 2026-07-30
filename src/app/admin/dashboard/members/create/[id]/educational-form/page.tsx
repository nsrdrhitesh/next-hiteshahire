"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import SearchableSelect from '../../../../components/ui/SearchableSelect';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

// ======================== UPDATED INTERFACES ========================

interface Option {
  id: string;
  name: string;
  isGroup?: boolean;           // true = group header (non-selectable)
}

interface FetchOptionsResult {
  data: Option[];
  hasNextPage: boolean;
}

interface EducationProfessionData {
  id?: string;
  memberId?: string;
  highestEducationId: number;
  highestEducationOther: string | null;
  specificationId: number;
  specificationOther: string | null;
  employmentTypeId: number;
  occupationId: number | null;
  businessTypeId: number | null;
  businessLocation: string | null;
  designation: string | null;
  companyName: string | null;
  jobTitle: string | null;
  workModeId: number | null;
  workLocation: string | null;
  annualIncomeId: number | null;
  totalWealthId: number | null;
}

// ======================== API SECTION ========================

// Reusable fetch with grouping support
const fetchGroupedOptions = async (
  endpoint: string,
  search = ""
): Promise<FetchOptionsResult> => {
  try {
    const res = await fetch(
      `${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error("API error");

    const items = json.data?.data || [];

    const options: Option[] = [];

    items.forEach((item: any) => {
      const groupName = 
        item.educationGroup?.name || 
        item.specializationGroup?.name || 
        item.occupationGroup?.name;

      // Add group header if it exists and not already added
      if (groupName && !options.some(opt => opt.isGroup && opt.name === groupName)) {
        options.push({
          id: `group-${groupName}`,
          name: groupName,
          isGroup: true,
        });
      }

      // Add actual option
      options.push({
        id: String(item.id),
        name: item.name || "Unnamed",
      });
    });

    return {
      data: options,
      hasNextPage: json.data?.meta?.hasNextPage ?? false,
    };
  } catch (err) {
    console.warn(`Failed to fetch ${endpoint}:`, err);
    return { data: [], hasNextPage: false };
  }
};

// Flat fetch for fields that don't need grouping
const fetchOptions = async (
  endpoint: string,
  search = ""
): Promise<FetchOptionsResult> => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error("API error");

    const items = json.data?.data || [];

    const options = items.map((item: any) => ({
      id: String(item.id),
      name: item.name || "",
    }));

    return {
      data: options,
      hasNextPage: json.data?.meta?.hasNextPage ?? false,
    };
  } catch (err) {
    console.warn(`Failed to fetch ${endpoint}:`, err);
    return { data: [], hasNextPage: false };
  }
};

// API Methods
const api = {
  getHighestEducation: (search = "") => fetchGroupedOptions(`member-get/education`, search),
  getSpecialization: (search = "") => fetchGroupedOptions(`member-get/specialization`, search),
  getOccupation: (search = "") => fetchGroupedOptions(`member-get/occupation`, search),

  // These don't need grouping
  getEmploymentTypes: (search = "") => fetchOptions(`member-get/employment-type`, search),
  getBusinessTypes: (search = "") => fetchOptions(`member-get/business-type`, search),
  getWorkModes: (search = "") => fetchOptions(`member-get/work-mode`, search),
  getAnnualIncomes: (search = "") => fetchOptions(`member-get/annual-income`, search),
  getWealthRange: (search = "") => fetchOptions(`member-get/wealth-range`, search),
};

// ======================== FORM COMPONENT ========================

type FormData = {
  highestEducationId: string;
  highestEducationName: string;
  otherEducation: string;

  specificationId: string;
  specificationName: string;
  otherSpecification: string;

  employmentTypeId: string;
  employmentTypeName: string;

  occupationId: string;
  occupationName: string;

  businessTypeId: string;
  businessTypeName: string;

  designation: string;
  companyName: string;
  jobTitle: string;
  workModeId: string;
  workModeName: string;
  workLocation: string;
  annualIncomeId: string;
  totalWealthId: string;
  annualIncomeName: string;
  businessLocation: string;
};

const initialFormData: FormData = {
  highestEducationId: "", highestEducationName: "", otherEducation: "",
  specificationId: "", specificationName: "", otherSpecification: "",
  employmentTypeId: "", employmentTypeName: "",
  occupationId: "", occupationName: "",
  businessTypeId: "", businessTypeName: "",
  designation: "", companyName: "", jobTitle: "",
  workModeId: "", workModeName: "",
  workLocation: "",
  annualIncomeId: "",
  totalWealthId: "",
  annualIncomeName: "",
  businessLocation: "",
};

export default function RegistrationStep5() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch existing data when component mounts
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!memberId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setFetchError(null);
        
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          console.log("No access token found");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/member-get/education-profession/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success && result.data?.data) {
          const existingData: EducationProfessionData = result.data.data;
          
          // Populate form with existing data
          setFormData({
            highestEducationId: existingData.highestEducationId ? String(existingData.highestEducationId) : "",
            highestEducationName: "",
            otherEducation: existingData.highestEducationOther || "",
            specificationId: existingData.specificationId ? String(existingData.specificationId) : "",
            specificationName: "",
            otherSpecification: existingData.specificationOther || "",
            employmentTypeId: existingData.employmentTypeId ? String(existingData.employmentTypeId) : "",
            employmentTypeName: "",
            occupationId: existingData.occupationId ? String(existingData.occupationId) : "",
            occupationName: "",
            businessTypeId: existingData.businessTypeId ? String(existingData.businessTypeId) : "",
            businessTypeName: "",
            designation: existingData.designation || "",
            companyName: existingData.companyName || "",
            jobTitle: existingData.jobTitle || "",
            workModeId: existingData.workModeId ? String(existingData.workModeId) : "",
            workModeName: "",
            workLocation: existingData.workLocation || "",
            annualIncomeId: existingData.annualIncomeId ? String(existingData.annualIncomeId) : "",
            totalWealthId: existingData.totalWealthId ? String(existingData.totalWealthId) : "",
            annualIncomeName: "",
            businessLocation: existingData.businessLocation || "",
          });
          
          console.log("Existing data loaded:", existingData);
        } else {
          // No data found or API error - keep empty form
          console.log("No existing data found, using empty form");
        }
      } catch (error) {
        console.error("Error fetching existing data:", error);
        setFetchError("Could not load existing data. Starting with empty form.");
        // Keep empty form on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingData();
  }, [memberId]);

  const handleBack = () => {
    // 👉 your custom logic here
    console.log("Running back button logic");
    // 👉 then navigate
    router.push(`/admin/dashboard/members/create/${params.id}/basic-form`);
  };

  // Employment type conditions based on the actual IDs from your API
  const isSalaried = formData.employmentTypeId === "2" || formData.employmentTypeId === "1" || formData.employmentTypeId === "3";
  const isBusiness = formData.employmentTypeId === "5";
  const isFreelancer = formData.employmentTypeId === "6";
  const isStudent = formData.employmentTypeId === "7";
  const isNotWorking = formData.employmentTypeId === "8";
  const isFarming = formData.employmentTypeId === "9";
  const isDefence = formData.employmentTypeId === "4";
  
  // Show business type for Business/Self Employed
  const showBusinessType = isBusiness;
  
  // Show salaried fields for Government, Private Sector, Civil Service
  const showSalariedFields = isSalaried;
  
  // Show occupation field (hide for student)
  const showOccupation = !isStudent;
  
  // Show work mode and work location (hide for student, not working)
  const showWorkDetails = !isStudent && !isNotWorking;
  
  // Show annual income (hide for student, not working)
  const showAnnualIncome = !isStudent && !isNotWorking;
  
  // Show business location (only for business)
  const showBusinessLocation = isBusiness;
  
  // Show defense-specific fields
  const showDefenseFields = isDefence;

  const showOtherEducation = formData.highestEducationName?.toLowerCase().includes("other") || 
                              (formData.otherEducation && !formData.highestEducationId);
  const showOtherSpecification = formData.specificationName?.toLowerCase().includes("other") || 
                                  (formData.otherSpecification && !formData.specificationId);

  // Reset dependent fields when employment type changes
  useEffect(() => {
    const resetData: Partial<FormData> = {};
    
    if (isBusiness) {
      // Clear salaried fields
      resetData.designation = "";
      resetData.companyName = "";
      resetData.jobTitle = "";
    } else if (isSalaried) {
      // Clear business fields
      resetData.businessTypeId = "";
      resetData.businessTypeName = "";
      resetData.businessLocation = "";
    } else if (isStudent || isNotWorking) {
      // Clear occupation and work related fields for student/not working
      resetData.occupationId = "";
      resetData.occupationName = "";
      resetData.workModeId = "";
      resetData.workModeName = "";
      resetData.workLocation = "";
      resetData.annualIncomeId = "";
      resetData.annualIncomeName = "";
      resetData.designation = "";
      resetData.companyName = "";
      resetData.jobTitle = "";
      resetData.businessTypeId = "";
      resetData.businessTypeName = "";
      resetData.businessLocation = "";
    } else if (isFreelancer || isFarming) {
      // Clear salaried and business fields for freelancer/farming
      resetData.designation = "";
      resetData.companyName = "";
      resetData.jobTitle = "";
      resetData.businessTypeId = "";
      resetData.businessTypeName = "";
      resetData.businessLocation = "";
    }
    
    if (Object.keys(resetData).length > 0) {
      setFormData(prev => ({ ...prev, ...resetData }));
    }
  }, [formData.employmentTypeId, isBusiness, isSalaried, isStudent, isNotWorking, isFreelancer, isFarming]);

  const validate = useCallback((name: keyof FormData, value: string) => {
    let error = "";

    // Required fields validation
    if (["highestEducationId", "specificationId", "employmentTypeId"].includes(name as string) && !value) {
      error = `${name.replace(/Id$/, "").replace(/([A-Z])/g, " $1").trim()} is required`;
    }

    // Occupation validation (only if shown)
    if (name === "occupationId" && showOccupation && !value) {
      error = "Occupation is required";
    }

    // Work mode validation (only if shown)
    if (name === "workModeId" && showWorkDetails && !value) {
      error = "Work Mode is required";
    }

    // Annual income validation (only if shown)
    if (name === "annualIncomeId" && showAnnualIncome && !value) {
      error = "Annual Income is required";
    }

    if (showOtherEducation && name === "otherEducation" && !value.trim()) error = "Other Education is required";
    if (showOtherSpecification && name === "otherSpecification" && !value.trim()) error = "Other Specialization is required";

    if (showSalariedFields) {
      if (name === "designation" && !value.trim()) error = "Designation is required";
      if (name === "companyName" && !value.trim()) error = "Company Name is required";
      if (name === "jobTitle" && !value.trim()) error = "Job Title is required";
    }

    if (showBusinessType) {
      if (name === "businessTypeId" && !value) error = "Business Type is required";
      if (name === "businessLocation" && !value.trim()) error = "Business Location is required";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, [showSalariedFields, showBusinessType, showOtherEducation, showOtherSpecification, showOccupation, showWorkDetails, showAnnualIncome]);

  const handleSelectChange = useCallback((
    field: keyof FormData,
    nameField: keyof FormData,
    value: string,
    option?: Option | null
  ) => {
    setFormData(prev => {
      const updated: any = {
        ...prev,
        [field]: value,
        [nameField]: option?.name || "",
      };

      if (field === "employmentTypeId") {
        updated.designation = updated.companyName = updated.jobTitle = "";
        updated.businessTypeId = updated.businessTypeName = updated.businessLocation = "";
        updated.occupationId = updated.occupationName = "";
        updated.workModeId = updated.workModeName = "";
        updated.workLocation = "";
        updated.annualIncomeId = updated.annualIncomeName = "";
      }
      if (field === "highestEducationId") updated.otherEducation = "";
      if (field === "specificationId") updated.otherSpecification = "";

      return updated;
    });

    validate(field, value);
  }, [validate]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name as keyof FormData, value);
  };

  const isFormValid = () => {
    // Basic required fields
    const basicValid = !!formData.highestEducationId &&
      !!formData.specificationId &&
      !!formData.employmentTypeId &&
      (!showOtherEducation || !!formData.otherEducation.trim()) &&
      (!showOtherSpecification || !!formData.otherSpecification.trim());
    
    if (!basicValid) return false;
    
    // Occupation validation
    if (showOccupation && !formData.occupationId) return false;
    
    // Work details validation
    if (showWorkDetails && !formData.workModeId) return false;
    
    // Annual income validation
    if (showAnnualIncome && !formData.annualIncomeId) return false;
    
    // Employment type specific validations
    if (showSalariedFields) {
      return !!(formData.designation.trim() && formData.companyName.trim() && formData.jobTitle.trim());
    }
    
    if (showBusinessType) {
      return !!(formData.businessTypeId && formData.businessLocation.trim());
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) return router.push("/login");

    const payload = {
      member_id: Number(params.id),
      highest_education_id: Number(formData.highestEducationId),
      highest_education_other: showOtherEducation ? formData.otherEducation : null,
      specification_id: Number(formData.specificationId),
      specification_other: showOtherSpecification ? formData.otherSpecification : null,
      employment_type_id: Number(formData.employmentTypeId),
      occupation_id: showOccupation ? Number(formData.occupationId) : 0,
      business_type_id: showBusinessType ? Number(formData.businessTypeId) : null,
      designation: showSalariedFields ? formData.designation : null,
      company_name: showSalariedFields ? formData.companyName : null,
      job_title: showSalariedFields ? formData.jobTitle : null,
      work_mode_id: showWorkDetails ? Number(formData.workModeId) : 0,
      work_location: showWorkDetails ? (formData.workLocation || null) : null,
      annual_income_id: showAnnualIncome ? Number(formData.annualIncomeId) : 0,
      total_wealth_id: Number(formData.totalWealthId) || 0,
      business_location: showBusinessType ? formData.businessLocation : null,
    };

    console.log("Payload to submit:", payload);

    try {
      const response = await fetch(`${API_URL}/member/member-education-profession`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
      
      showSuccess("Education & Professional details saved successfully!");
      router.push(`/admin/dashboard/members/create/${params.id}/location-form`);
    } catch (err: any) {
      showError(err.message || "Something went wrong while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get helpful message based on employment type
  const getEmploymentTypeMessage = () => {
    if (isStudent) {
      return "📚 As a student, you only need to provide your education details. Occupation and work-related fields are not required.";
    }
    if (isNotWorking) {
      return "💼 As you're not currently working, only your education details are required.";
    }
    if (isFarming) {
      return "🌾 Please provide your farming-related occupation and work details below.";
    }
    if (isFreelancer) {
      return "💻 As a freelancer, please provide your occupation and work preferences.";
    }
    if (isDefence) {
      return "🎖️ Thank you for your service in the defence sector. Please provide your occupation details below.";
    }
    if (isBusiness) {
      return "🏢 Please provide your business type and location details.";
    }
    if (isSalaried) {
      return "💼 Please provide your employment details including designation, company, and job title.";
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">

      <PageHeader
        title="Education & Profession"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Education & Profession" },
        ]}
        step={{ current: 5, total: 10, description: "Education & Profession" }}
      />

      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 rounded-full ${i < 5 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"}`} />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 md:p-10">
          {fetchError && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ {fetchError}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <SearchableSelect
              label="Highest Education"
              value={formData.highestEducationId}
              onChange={(val, opt) => handleSelectChange("highestEducationId", "highestEducationName", val, opt)}
              fetchOptions={api.getHighestEducation}
              placeholder="Search highest education..."
              required
              error={errors.highestEducationId}
            />

            {showOtherEducation && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Other Education <span className="text-red-500">*</span></label>
                <input type="text" name="otherEducation" value={formData.otherEducation} onChange={handleTextChange}
                  className={`w-full rounded-2xl border px-5 py-3.5 ${errors.otherEducation ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                  placeholder="Please specify your education" />
                {errors.otherEducation && <p className="mt-1 text-xs text-red-500">{errors.otherEducation}</p>}
              </div>
            )}

            <SearchableSelect
              label="Specialization"
              value={formData.specificationId}
              onChange={(val, opt) => handleSelectChange("specificationId", "specificationName", val, opt)}
              fetchOptions={api.getSpecialization}
              placeholder="Search specialization..."
              required
              error={errors.specificationId}
            />

            {showOtherSpecification && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Other Specialization <span className="text-red-500">*</span></label>
                <input type="text" name="otherSpecification" value={formData.otherSpecification} onChange={handleTextChange}
                  className={`w-full rounded-2xl border px-5 py-3.5 ${errors.otherSpecification ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                  placeholder="Please specify your specialization" />
                {errors.otherSpecification && <p className="mt-1 text-xs text-red-500">{errors.otherSpecification}</p>}
              </div>
            )}

            <SearchableSelect
              label="Employment Type"
              value={formData.employmentTypeId}
              onChange={(val, opt) => handleSelectChange("employmentTypeId", "employmentTypeName", val, opt)}
              fetchOptions={api.getEmploymentTypes}
              placeholder="Select employment type..."
              required
              error={errors.employmentTypeId}
            />

            {/* Show helpful message based on employment type */}
            {getEmploymentTypeMessage() && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getEmploymentTypeMessage()}
                </p>
              </div>
            )}

            {/* Occupation Field - Hidden for Students */}
            {showOccupation && (
              <SearchableSelect
                label="Occupation"
                value={formData.occupationId}
                onChange={(val, opt) => handleSelectChange("occupationId", "occupationName", val, opt)}
                fetchOptions={api.getOccupation}
                placeholder="Search occupation..."
                required={showOccupation}
                error={errors.occupationId}
              />
            )}

            {/* Salaried fields - Show for Government, Private Sector, Civil Service */}
            {showSalariedFields && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Designation <span className="text-red-500">*</span></label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleTextChange}
                      className={`w-full rounded-2xl border px-5 py-3.5 ${errors.designation ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Software Engineer" />
                    {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleTextChange}
                      className={`w-full rounded-2xl border px-5 py-3.5 ${errors.companyName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="TCS / Infosys" />
                    {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Title <span className="text-red-500">*</span></label>
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleTextChange}
                      className={`w-full rounded-2xl border px-5 py-3.5 ${errors.jobTitle ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Senior Developer" />
                    {errors.jobTitle && <p className="mt-1 text-xs text-red-500">{errors.jobTitle}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Business fields - Show only for Business/Self Employed */}
            {showBusinessType && (
              <div className="space-y-6">
                <SearchableSelect
                  label="Business Type"
                  value={formData.businessTypeId}
                  onChange={(val, opt) => handleSelectChange("businessTypeId", "businessTypeName", val, opt)}
                  fetchOptions={api.getBusinessTypes}
                  placeholder="Select business type..."
                  required
                  error={errors.businessTypeId}
                />
                {showBusinessLocation && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Location <span className="text-red-500">*</span></label>
                    <input type="text" name="businessLocation" value={formData.businessLocation} onChange={handleTextChange}
                      className={`w-full rounded-2xl border px-5 py-3.5 ${errors.businessLocation ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Pune, Maharashtra" />
                    {errors.businessLocation && <p className="mt-1 text-xs text-red-500">{errors.businessLocation}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Work Mode - Hidden for Students and Not Working */}
            {showWorkDetails && (
              <SearchableSelect
                label="Work Mode"
                value={formData.workModeId}
                onChange={(val, opt) => handleSelectChange("workModeId", "workModeName", val, opt)}
                fetchOptions={api.getWorkModes}
                placeholder="Select work mode..."
                required={showWorkDetails}
                error={errors.workModeId}
              />
            )}

            {/* Work Location and Annual Income */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showWorkDetails && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Work Location</label>
                  <input type="text" name="workLocation" value={formData.workLocation} onChange={handleTextChange}
                    className="w-full rounded-2xl border px-5 py-3.5 border-gray-300 dark:border-gray-700" placeholder="Mumbai / Remote" />
                </div>
              )}

              {showAnnualIncome && (
                <SearchableSelect
                  label="Annual Income"
                  value={formData.annualIncomeId}
                  onChange={(val, opt) => handleSelectChange("annualIncomeId", "annualIncomeName", val, opt)}
                  fetchOptions={api.getAnnualIncomes}
                  placeholder="Select annual income..."
                  required={showAnnualIncome}
                  error={errors.annualIncomeId}
                />
              )}
            </div>

                <SearchableSelect
                  label="Wealth"
                  value={formData.totalWealthId}
                  onChange={(val, opt) => handleSelectChange("totalWealthId", "annualIncomeName", val, opt)}
                  fetchOptions={api.getWealthRange}
                  placeholder="Select annual income..."
                  required={showAnnualIncome}
                  error={errors.totalWealthId}
                />

            {/* Defense-specific fields */}
            {showDefenseFields && (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  🎖️ Defense personnel may be eligible for special benefits and schemes.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Basic Details
              </button>
              <button type="submit" disabled={!isFormValid() || isSubmitting}
                className={`flex-1 rounded-2xl py-4 text-base font-semibold transition-all ${
                  isFormValid() && !isSubmitting ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600" : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700"
                }`}>
                {isSubmitting ? "Saving..." : "Continue to Location Details →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}