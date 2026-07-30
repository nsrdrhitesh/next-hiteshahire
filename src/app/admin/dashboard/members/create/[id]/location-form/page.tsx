"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from '../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import SearchableSelect from '../../../../components/ui/SearchableSelect';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

// ======================== INTERFACES ========================
interface Option {
  id: string;
  name: string;
  isGroup?: boolean;
}

interface FetchOptionsResult {
  data: Option[];
  hasNextPage: boolean;
}

// ======================== API HELPERS ========================
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

    const uniqueMap = new Map<string, any>();
    items.forEach((item: any) => {
      const id = String(item.id || item.countryId || item.stateId || item.cityId);
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, item);
      }
    });

    const uniqueItems = Array.from(uniqueMap.values());

    const options = uniqueItems.map((item: any) => ({
      id: String(item.id || item.countryId || item.stateId || item.cityId),
      name: item.name || item.country_name || item.state_name || item.city_name || "Unnamed",
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

const api = {
  getCountries: (search = "") => fetchOptions("member-get/countries", search),
  getStates: (countryId: string, search = "") =>
    countryId ? fetchOptions(`member-get/states/${countryId}`, search) : Promise.resolve({ data: [], hasNextPage: false }),
  getCities: (stateId: string, search = "") =>
    stateId ? fetchOptions(`member-get/cities/${stateId}`, search) : Promise.resolve({ data: [], hasNextPage: false }),
  getVisaStatuses: (search = "") => fetchOptions("member-get/visa-status", search),
  getVisaTypes: (search = "") => fetchOptions("member-get/visa-type", search),
};

// ======================== FORM DATA ========================
type FormData = {
  // Permanent
  permanentCountryId: string;
  permanentCountryName: string;
  permanentStateId: string;
  permanentStateName: string;
  permanentCityId: string;
  permanentCityName: string;

  readyToRelocate: boolean;
  // Present (if different)
  sameAsPermanent: boolean;
  presentCountryId: string;
  presentCountryName: string;
  presentStateId: string;
  presentStateName: string;
  presentCityId: string;
  presentCityName: string;

  // General
  citizenshipId: string;
  citizenshipName: string;
  isAbroad: "yes" | "no";

  // Abroad related
  visaStatusId: string;
  visaStatusName: string;
};

const initialFormData: FormData = {
  permanentCountryId: "", permanentCountryName: "",
  permanentStateId: "", permanentStateName: "",
  permanentCityId: "", permanentCityName: "",

  sameAsPermanent: false,
  readyToRelocate: false,
  presentCountryId: "", presentCountryName: "",
  presentStateId: "", presentStateName: "",
  presentCityId: "", presentCityName: "",

  citizenshipId: "", citizenshipName: "",
  isAbroad: "no",

  visaStatusId: "", visaStatusName: "",
};

export default function RegistrationStep6() {
  const [hasStates, setHasStates] = useState(true);
  const [hasCities, setHasCities] = useState(true);
  const [hasPresentStates, setHasPresentStates] = useState(true);
  const [hasPresentCities, setHasPresentCities] = useState(true);
  const params = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(!!params.id);

  // Derived states
  const isAbroad = formData.isAbroad === "yes";
  const showPresentAddress = !formData.sameAsPermanent;

  // Validation logic
  const validate = useCallback((name: keyof FormData, value: string | boolean) => {
    let error = "";

    // Permanent Address
    if (name === "permanentCountryId" && !value) error = "Permanent Country is required";

    if (hasStates && name === "permanentStateId" && !value) {
      error = "Permanent State is required";
    }

    if (hasCities && name === "permanentCityId" && !value) {
      error = "Permanent City is required";
    }

    // Present Address (only if different)
    if (showPresentAddress) {
      if (name === "presentCountryId" && !value) {
        error = "Present Country is required";
      }

      if (hasPresentStates && name === "presentStateId" && !value) {
        error = "Present State is required";
      }

      if (hasPresentCities && name === "presentCityId" && !value) {
        error = "Present City is required";
      }
    }

    // Abroad
    if (isAbroad) {
      if (name === "visaStatusId" && !value) error = "Visa Status is required";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, [showPresentAddress, isAbroad, hasStates, hasCities, hasPresentStates, hasPresentCities]);

  const handleSelectChange = useCallback((
    field: keyof FormData,
    nameField: keyof FormData,
    value: string,
    option?: Option | null
  ) => {
    setFormData(prev => {
      const update: any = {
        ...prev,
        [field]: value,
        [nameField]: option?.name || "",
      };

      if (field === "permanentCountryId") {
        update.permanentStateId = "";
        update.permanentStateName = "";
        update.permanentCityId = "";
        update.permanentCityName = "";
        setHasStates(true);
        setHasCities(true);
      }

      if (field === "permanentStateId") {
        update.permanentCityId = "";
        update.permanentCityName = "";
        setHasCities(true);
      }

      if (field === "presentCountryId") {
        update.presentStateId = "";
        update.presentStateName = "";
        update.presentCityId = "";
        update.presentCityName = "";
        setHasPresentStates(true);
        setHasPresentCities(true);
      }

      if (field === "presentStateId") {
        update.presentCityId = "";
        update.presentCityName = "";
        setHasPresentCities(true);
      }

      if (field === "sameAsPermanent") {
        if (value) {
          update.presentCountryId = prev.permanentCountryId;
          update.presentCountryName = prev.permanentCountryName;
          update.presentStateId = prev.permanentStateId;
          update.presentStateName = prev.permanentStateName;
          update.presentCityId = prev.permanentCityId;
          update.presentCityName = prev.permanentCityName;
        } else {
          update.presentCountryId = "";
          update.presentCountryName = "";
          update.presentStateId = "";
          update.presentStateName = "";
          update.presentCityId = "";
          update.presentCityName = "";
        }
      }

      if (field === "isAbroad" && value === "no") {
        update.visaStatusId = "";
        update.visaStatusName = "";
      }

      return update;
    });

    validate(field, value);
  }, [validate]);

  useEffect(() => {
    if (!params.id) {
      setIsLoading(false);
      return;
    }

    const memberId = params.id;

    const loadExistingData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const res = await fetch(`${API_URL}/member-get/location/${memberId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("fetch failed");

        const json = await res.json();

        if (!json.success || !json.data?.data) {
          throw new Error("invalid response");
        }

        const d = json.data.data;

        const newForm: FormData = {
          ...initialFormData,

          permanentCountryId: d.permanentCountryId ? String(d.permanentCountryId) : "",
          permanentStateId:   d.permanentStateId   ? String(d.permanentStateId)   : "",
          permanentCityId:    d.permanentCityId    ? String(d.permanentCityId)    : "",

          sameAsPermanent:  !!d.isSameAsPermanent,
          readyToRelocate:  d.isReadyToRelocate,

          presentCountryId: d.presentCountryId ? String(d.presentCountryId) : "",
          presentStateId:   d.presentStateId   ? String(d.presentStateId)   : "",
          presentCityId:    d.presentCityId    ? String(d.presentCityId)    : "",

          isAbroad: d.isAbroad === 1 ? "yes" : "no",

          citizenshipId: d.citizenshipId ? String(d.citizenshipId) : "",

          visaStatusId: d.visaStatusId ? String(d.visaStatusId) : "",
        };

        setFormData(newForm);

        setHasStates(!!d.permanentStateId);
        setHasCities(!!d.permanentCityId);
        setHasPresentStates(!!d.presentStateId);
        setHasPresentCities(!!d.presentCityId);

      } catch (err) {
        console.warn("Could not load existing location data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();

  }, [params.id, API_URL]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData(prev => {
      const update: any = {
        ...prev,
        [name]: checked,
      };

      if (name === "sameAsPermanent") {
        if (checked) {
          update.presentCountryId = prev.permanentCountryId;
          update.presentCountryName = prev.permanentCountryName;
          update.presentStateId = prev.permanentStateId;
          update.presentStateName = prev.permanentStateName;
          update.presentCityId = prev.permanentCityId;
          update.presentCityName = prev.permanentCityName;
        } else {
          update.presentCountryId = "";
          update.presentCountryName = "";
          update.presentStateId = "";
          update.presentStateName = "";
          update.presentCityId = "";
          update.presentCityName = "";
        }
      }

      return update;
    });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name as keyof FormData, value);
  };

  // Form validity check
  const isFormValid =
    !!formData.permanentCountryId &&
    (!hasStates || !!formData.permanentStateId) &&
    (!hasCities || !!formData.permanentCityId) &&
    (!showPresentAddress ||
      (!!formData.presentCountryId &&
        (!hasPresentStates || !!formData.presentStateId) &&
        (!hasPresentCities || !!formData.presentCityId)
      )
    );

  const handleBack = () => {
    router.push(`/admin/dashboard/members/create/${params.id}/educational-form`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      showError("Please login again");
      return router.push("/login");
    }

    const payload = {
      member_id: Number(params.id),

      permanent_country_id: Number(formData.permanentCountryId),
      permanent_state_id:   Number(formData.permanentStateId),
      permanent_city_id:    Number(formData.permanentCityId),

      present_country_id: formData.sameAsPermanent
        ? Number(formData.permanentCountryId)
        : Number(formData.presentCountryId),
      present_state_id: formData.sameAsPermanent
        ? Number(formData.permanentStateId)
        : Number(formData.presentStateId),
      present_city_id: formData.sameAsPermanent
        ? Number(formData.permanentCityId)
        : Number(formData.presentCityId),

      is_same_as_permanent: formData.sameAsPermanent ? 1 : 0,
      is_ready_to_relocate: formData.readyToRelocate ? 1 : 0,
      citizenship_id: Number(formData.citizenshipId),
      is_abroad: formData.isAbroad === "yes" ? 1 : 0,

      visa_status_id: isAbroad ? Number(formData.visaStatusId) : null,
    };

    try {
      const response = await fetch(`${API_URL}/member/member-residence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save location details");
      }

      showSuccess("Location details saved successfully!");
      router.push(`/admin/dashboard/members/create/${params.id}/partner-preference`);
    } catch (err: any) {
      showError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">

      <PageHeader
        title="Location Details"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Location Details" },
        ]}
        step={{ current: 6, total: 10, description: "Location Details" }}
      />

      <div className="flex justify-center px-4">
        <div className="flex w-full max-w-md gap-1.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${
                i < 6 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ==================== PERMANENT ADDRESS ==================== */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
                Permanent Address
              </h3>

              <SearchableSelect
                label="Permanent Country"
                value={formData.permanentCountryId}
                onChange={(val, opt) => handleSelectChange("permanentCountryId", "permanentCountryName", val, opt)}
                fetchOptions={api.getCountries}
                placeholder="Search country..."
                required
                error={errors.permanentCountryId}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableSelect
                  label="Permanent State"
                  value={formData.permanentStateId}
                  onChange={(val, opt) => handleSelectChange("permanentStateId", "permanentStateName", val, opt)}
                  fetchOptions={async (search) => {
                    const res = await api.getStates(formData.permanentCountryId, search);
                    setHasStates(res.data.length > 0);
                    return res;
                  }}
                  disabled={!formData.permanentCountryId || !hasStates}
                />
                {!hasStates && (
                  <p className="text-sm text-gray-500">No states available for this country</p>
                )}

                <SearchableSelect
                  label="Permanent City"
                  value={formData.permanentCityId}
                  onChange={(val, opt) => handleSelectChange("permanentCityId", "permanentCityName", val, opt)}
                  fetchOptions={async (search) => {
                    const res = await api.getCities(formData.permanentStateId, search);
                    setHasCities(res.data.length > 0);
                    return res;
                  }}
                  disabled={!formData.permanentStateId || !hasCities}
                />
                {!hasCities && (
                  <p className="text-sm text-gray-500">No cities available for this state</p>
                )}
              </div>
            </div>

            {/* Same as permanent */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sameAsPermanent"
                name="sameAsPermanent"
                checked={formData.sameAsPermanent}
                onChange={handleCheckboxChange}
                className="w-5 h-5 accent-purple-600"
              />
              <label
                htmlFor="sameAsPermanent"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Present address is same as permanent address
              </label>
            </div>

            {/* ==================== PRESENT ADDRESS ==================== */}
            {showPresentAddress && (
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Present Address
                </h3>

                <SearchableSelect
                  label="Present Country"
                  value={formData.presentCountryId}
                  onChange={(val, opt) => handleSelectChange("presentCountryId", "presentCountryName", val, opt)}
                  fetchOptions={api.getCountries}
                  placeholder="Search country..."
                  required
                  error={errors.presentCountryId}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableSelect
                    label="Present State"
                    value={formData.presentStateId}
                    onChange={(val, opt) =>
                      handleSelectChange("presentStateId", "presentStateName", val, opt)
                    }
                    fetchOptions={async (search) => {
                      const res = await api.getStates(formData.presentCountryId, search);
                      setHasPresentStates(res.data.length > 0);
                      return res;
                    }}
                    placeholder="Search state..."
                    required={hasPresentStates}
                    error={errors.presentStateId}
                    disabled={!formData.presentCountryId || !hasPresentStates}
                  />
                  {!hasPresentStates && (
                    <p className="text-sm text-gray-500">No states available for this country</p>
                  )}

                  <SearchableSelect
                    label="Present City"
                    value={formData.presentCityId}
                    onChange={(val, opt) =>
                      handleSelectChange("presentCityId", "presentCityName", val, opt)
                    }
                    fetchOptions={async (search) => {
                      const res = await api.getCities(formData.presentStateId, search);
                      setHasPresentCities(res.data.length > 0);
                      return res;
                    }}
                    placeholder="Search city..."
                    required={hasPresentCities}
                    error={errors.presentCityId}
                    disabled={!formData.presentStateId || !hasPresentCities}
                  />
                  {!hasPresentCities && (
                    <p className="text-sm text-gray-500">No cities available for this state</p>
                  )}
                </div>
              </div>
            )}

            {/* ==================== ABROAD ==================== */}
            <div className="pt-6 border-t space-y-6">

              {/* Live Abroad? */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Do you live abroad?
                </label>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAbroad"
                      value="no"
                      checked={formData.isAbroad === "no"}
                      onChange={handleRadioChange}
                      className="accent-purple-600"
                    />
                    <span>No</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAbroad"
                      value="yes"
                      checked={formData.isAbroad === "yes"}
                      onChange={handleRadioChange}
                      className="accent-purple-600"
                    />
                    <span>Yes</span>
                  </label>
                </div>
              </div>

              {/* Visa fields - only if abroad */}
              {isAbroad && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <SearchableSelect
                    label="Citizenship"
                    value={formData.citizenshipId}
                    onChange={(val, opt) => handleSelectChange("citizenshipId", "citizenshipName", val, opt)}
                    fetchOptions={api.getCountries}
                    placeholder="Search citizenship country..."
                    required
                    error={errors.citizenshipId}
                  />

                  <SearchableSelect
                    label="Visa Status"
                    value={formData.visaStatusId}
                    onChange={(val, opt) => handleSelectChange("visaStatusId", "visaStatusName", val, opt)}
                    fetchOptions={api.getVisaStatuses}
                    placeholder="Select visa status..."
                    required
                    error={errors.visaStatusId}
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t space-y-6">
              {/* Ready to Relocate */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="readyToRelocate"
                  name="readyToRelocate"
                  checked={formData.readyToRelocate}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 accent-purple-600"
                />
                <label
                  htmlFor="readyToRelocate"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Ready to Relocate
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-8 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Educational Details
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`flex-1 rounded-2xl py-4 text-base font-semibold transition-all ${
                  isFormValid && !isSubmitting
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600"
                    : "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700"
                }`}
              >
                {isSubmitting ? "Saving..." : "Continue to Partner Reference →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}