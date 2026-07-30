"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "../../lib/swalHelper";
import { Breadcrumb } from "../../components/ui/breadcrumb";

interface OfferConditionFormData {
  name: string;
  min_age: number | null;
  max_age: number | null;
  gender: string[];
  city: string[];
  state: string[];
  country: string[];
  annual_income: number | null;
  wealth: number | null;
  nri: boolean;
  applicable_plan_ids: number[];
  applicable_discount_ids: number[];
  applicable_device_codes: string[];
  plan_start_time_after_approval: number | null;
  plan_end_time_after_approval: number | null;
  timespan_reg_approval_gt: number | null;
  timespan_reg_approval_lt: number | null;
  plan_start_date: string;
  plan_end_date: string;
  registration_start_time: number | null;
  registration_end_time: number | null;
  after_approval_date: string;
  before_approval_date: string;
  after_registration_date: string;
  before_registration_date: string;
  is_active: boolean;
}

interface Plan {
  id: number;
  name: string;
  slug: string;
}

interface Offer {
  id: number;
  name: string;
}

interface DeviceType {
  id: number;
  device_code: string;
  device_name: string;
}

interface OfferConditionFormProps {
  mode: "create" | "edit";
  conditionId?: string;
}

export default function OfferConditionForm({ mode, conditionId }: OfferConditionFormProps) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();

  const [formData, setFormData] = useState<OfferConditionFormData>({
    name: "",
    min_age: null,
    max_age: null,
    gender: [],
    city: [],
    state: [],
    country: [],
    annual_income: null,
    wealth: null,
    nri: false,
    applicable_plan_ids: [],
    applicable_discount_ids: [],
    applicable_device_codes: [],
    plan_start_time_after_approval: null,
    plan_end_time_after_approval: null,
    timespan_reg_approval_gt: null,
    timespan_reg_approval_lt: null,
    plan_start_date: "",
    plan_end_date: "",
    registration_start_time: null,
    registration_end_time: null,
    after_approval_date: "",
    before_approval_date: "",
    after_registration_date: "",
    before_registration_date: "",
    is_active: true,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("basic");

  const genderOptions = ["Male", "Female", "Other"];
  const incomeRanges = [
    { value: 0, label: "Below ₹3 Lakhs" },
    { value: 300000, label: "₹3 - ₹6 Lakhs" },
    { value: 600000, label: "₹6 - ₹10 Lakhs" },
    { value: 1000000, label: "₹10 - ₹25 Lakhs" },
    { value: 2500000, label: "₹25 - ₹50 Lakhs" },
    { value: 5000000, label: "Above ₹50 Lakhs" },
  ];
  const wealthRanges = [
    { value: 0, label: "Below ₹10 Lakhs" },
    { value: 1000000, label: "₹10 - ₹25 Lakhs" },
    { value: 2500000, label: "₹25 - ₹50 Lakhs" },
    { value: 5000000, label: "₹50 Lakhs - ₹1 Crore" },
    { value: 10000000, label: "Above ₹1 Crore" },
  ];

  // Fetch plans, offers, and device types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) return;

        const [plansRes, offersRes, devicesRes] = await Promise.all([
          fetch(`${API_URL}/plans?limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/plan-offers?limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/device-types`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
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
          setDeviceTypes(devicesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Fetch condition data for edit mode
  useEffect(() => {
    if (mode === "edit" && conditionId) {
      const fetchCondition = async () => {
        try {
          const accessToken = localStorage.getItem("access_token");
          if (!accessToken) {
            router.push("/login");
            return;
          }

          const response = await fetch(`${API_URL}/plan-offer-conditions/${conditionId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch condition");
          }

          const result = await response.json();
          setFormData({
            name: result.data.name,
            min_age: result.data.min_age,
            max_age: result.data.max_age,
            gender: result.data.gender || [],
            city: result.data.city || [],
            state: result.data.state || [],
            country: result.data.country || [],
            annual_income: result.data.annual_income,
            wealth: result.data.wealth,
            nri: result.data.nri === 1,
            applicable_plan_ids: result.data.applicable_plan_ids || [],
            applicable_discount_ids: result.data.applicable_discount_ids || [],
            applicable_device_codes: result.data.applicable_device_codes || [],
            plan_start_time_after_approval: result.data.plan_start_time_after_approval,
            plan_end_time_after_approval: result.data.plan_end_time_after_approval,
            timespan_reg_approval_gt: result.data.timespan_reg_approval_gt,
            timespan_reg_approval_lt: result.data.timespan_reg_approval_lt,
            plan_start_date: result.data.plan_start_date || "",
            plan_end_date: result.data.plan_end_date || "",
            registration_start_time: result.data.registration_start_time,
            registration_end_time: result.data.registration_end_time,
            after_approval_date: result.data.after_approval_date || "",
            before_approval_date: result.data.before_approval_date || "",
            after_registration_date: result.data.after_registration_date || "",
            before_registration_date: result.data.before_registration_date || "",
            is_active: result.data.is_active === 1,
          });
        } catch (err) {
          setError("Failed to load condition data");
        } finally {
          setIsFetching(false);
        }
      };

      fetchCondition();
    }
  }, [mode, conditionId, router]);

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

  const handleMultiSelect = (field: keyof OfferConditionFormData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handlePlanSelect = (planId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicable_plan_ids];
      if (current.includes(planId)) {
        return { ...prev, applicable_plan_ids: current.filter((id) => id !== planId) };
      } else {
        return { ...prev, applicable_plan_ids: [...current, planId] };
      }
    });
  };

  const handleOfferSelect = (offerId: number) => {
    setFormData((prev) => {
      const current = [...prev.applicable_discount_ids];
      if (current.includes(offerId)) {
        return { ...prev, applicable_discount_ids: current.filter((id) => id !== offerId) };
      } else {
        return { ...prev, applicable_discount_ids: [...current, offerId] };
      }
    });
  };

  const handleDeviceSelect = (deviceCode: string) => {
    setFormData((prev) => {
      const current = [...prev.applicable_device_codes];
      if (current.includes(deviceCode)) {
        return { ...prev, applicable_device_codes: current.filter((code) => code !== deviceCode) };
      } else {
        return { ...prev, applicable_device_codes: [...current, deviceCode] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
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

      const url = mode === "create" 
        ? `${API_URL}/plan-offer-conditions` 
        : `${API_URL}/plan-offer-conditions/${conditionId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const submitData = {
        ...formData,
        nri: formData.nri ? 1 : 0,
        is_active: formData.is_active ? 1 : 0,
      };

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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
          setError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setIsLoading(false);
        return;
      }

      await showSuccess(
        mode === "create"
          ? "Offer condition created successfully"
          : "Offer condition updated successfully"
      );

      router.push("/admin/dashboard/plans-section/offer-conditions");
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} condition`);
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tabs = [
    { id: "basic", name: "Basic Info" },
    { id: "demographic", name: "Demographic" },
    { id: "financial", name: "Financial" },
    { id: "applicability", name: "Applicability" },
    { id: "timing", name: "Timing Rules" },
  ];

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Plans Section", href: "/admin/dashboard/plans-section" },
              { label: "Offer Conditions", href: "/admin/dashboard/plans-section/offer-conditions" },
              { label: mode === "create" ? "Create" : "Edit" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create New Offer Condition" : "Edit Offer Condition"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {mode === "create"
              ? "Define eligibility rules for offers and discounts"
              : "Update condition details and eligibility rules"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/plans-section/offer-conditions"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="condition-form"
            disabled={isLoading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-lg disabled:opacity-70"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Condition"
              : "Update Condition"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600 dark:text-purple-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form id="condition-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <>
                {/* Condition Name */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Condition Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., New User Discount, Festival Offer Eligibility"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Status
                    </label>
                    <div className="relative inline-block w-12 align-middle select-none">
                      <input
                        type="checkbox"
                        name="is_active"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="is_active"
                        className={`block h-6 w-12 overflow-hidden rounded-full cursor-pointer transition-colors ${
                          formData.is_active
                            ? "bg-gradient-to-r from-purple-600 to-pink-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                            formData.is_active ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formData.is_active
                      ? "Condition is active and will be applied"
                      : "Condition is inactive and won't be evaluated"}
                  </p>
                </div>
              </>
            )}

            {/* Demographic Tab */}
            {activeTab === "demographic" && (
              <>
                {/* Age Range */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Age Range
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Minimum Age
                      </label>
                      <input
                        type="number"
                        name="min_age"
                        value={formData.min_age || ""}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 18"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Maximum Age
                      </label>
                      <input
                        type="number"
                        name="max_age"
                        value={formData.max_age || ""}
                        onChange={handleChange}
                        min="0"
                        max="120"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 35"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Gender
                  </label>
                  <div className="space-y-2">
                    {genderOptions.map((gender) => (
                      <label key={gender} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.gender.includes(gender)}
                          onChange={() => handleMultiSelect("gender", gender)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Leave empty to apply to all genders
                  </p>
                </div>

                {/* Location Fields */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Location Restrictions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cities
                      </label>
                      <input
                        type="text"
                        value={formData.city.join(", ")}
                        onChange={(e) => {
                          const cities = e.target.value.split(",").map(c => c.trim()).filter(c => c);
                          setFormData(prev => ({ ...prev, city: cities }));
                        }}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Mumbai, Delhi, Bangalore"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        States
                      </label>
                      <input
                        type="text"
                        value={formData.state.join(", ")}
                        onChange={(e) => {
                          const states = e.target.value.split(",").map(s => s.trim()).filter(s => s);
                          setFormData(prev => ({ ...prev, state: states }));
                        }}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Maharashtra, Delhi, Karnataka"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Countries
                      </label>
                      <input
                        type="text"
                        value={formData.country.join(", ")}
                        onChange={(e) => {
                          const countries = e.target.value.split(",").map(c => c.trim()).filter(c => c);
                          setFormData(prev => ({ ...prev, country: countries }));
                        }}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="India, USA, UK"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Leave empty to apply to all locations
                  </p>
                </div>
              </>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <>
                {/* Annual Income */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Annual Income Range
                  </label>
                  <select
                    name="annual_income"
                    value={formData.annual_income || ""}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Any Income</option>
                    {incomeRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Minimum annual income required for eligibility
                  </p>
                </div>

                {/* Wealth */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Wealth / Net Worth Range
                  </label>
                  <select
                    name="wealth"
                    value={formData.wealth || ""}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Any Wealth</option>
                    {wealthRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Minimum wealth/net worth required for eligibility
                  </p>
                </div>

                {/* NRI Status */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      NRI (Non-Resident Indian)
                    </label>
                    <input
                      type="checkbox"
                      name="nri"
                      checked={formData.nri}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Apply this condition only to NRI users
                  </p>
                </div>
              </>
            )}

            {/* Applicability Tab */}
            {activeTab === "applicability" && (
              <>
                {/* Applicable Plans */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Applicable Plans
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {plans.map((plan) => (
                      <label key={plan.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.applicable_plan_ids.includes(plan.id)}
                          onChange={() => handlePlanSelect(plan.id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{plan.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which plans this condition applies to (leave empty for all plans)
                  </p>
                </div>

                {/* Applicable Offers */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Applicable Offers/Discounts
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {offers.map((offer) => (
                      <label key={offer.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.applicable_discount_ids.includes(offer.id)}
                          onChange={() => handleOfferSelect(offer.id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{offer.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which offers this condition applies to
                  </p>
                </div>

                {/* Applicable Devices */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Applicable Device Types
                  </label>
                  <div className="space-y-2">
                    {deviceTypes.map((device) => (
                      <label key={device.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.applicable_device_codes.includes(device.device_code)}
                          onChange={() => handleDeviceSelect(device.device_code)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {device.device_name} ({device.device_code})
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Select which device types this condition applies to (leave empty for all devices)
                  </p>
                </div>
              </>
            )}

            {/* Timing Rules Tab */}
            {activeTab === "timing" && (
              <>
                {/* Plan Timing */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Plan Timing Rules
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plan Start Time (hours after approval)
                      </label>
                      <input
                        type="number"
                        name="plan_start_time_after_approval"
                        value={formData.plan_start_time_after_approval || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plan End Time (hours after approval)
                      </label>
                      <input
                        type="number"
                        name="plan_end_time_after_approval"
                        value={formData.plan_end_time_after_approval || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Approval Timespan */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Registration to Approval Timespan
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Greater Than (hours)
                      </label>
                      <input
                        type="number"
                        name="timespan_reg_approval_gt"
                        value={formData.timespan_reg_approval_gt || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Less Than (hours)
                      </label>
                      <input
                        type="number"
                        name="timespan_reg_approval_lt"
                        value={formData.timespan_reg_approval_lt || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Ranges */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Date Range Restrictions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plan Start Date
                      </label>
                      <input
                        type="date"
                        name="plan_start_date"
                        value={formData.plan_start_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Plan End Date
                      </label>
                      <input
                        type="date"
                        name="plan_end_date"
                        value={formData.plan_end_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Timing */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Registration Time Restrictions
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Registration Start Time (hours)
                      </label>
                      <input
                        type="number"
                        name="registration_start_time"
                        value={formData.registration_start_time || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Registration End Time (hours)
                      </label>
                      <input
                        type="number"
                        name="registration_end_time"
                        value={formData.registration_end_time || ""}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Hours"
                      />
                    </div>
                  </div>
                </div>

                {/* Approval/Registration Dates */}
                <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Approval & Registration Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        After Approval Date
                      </label>
                      <input
                        type="date"
                        name="after_approval_date"
                        value={formData.after_approval_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Before Approval Date
                      </label>
                      <input
                        type="date"
                        name="before_approval_date"
                        value={formData.before_approval_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        After Registration Date
                      </label>
                      <input
                        type="date"
                        name="after_registration_date"
                        value={formData.after_registration_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Before Registration Date
                      </label>
                      <input
                        type="date"
                        name="before_registration_date"
                        value={formData.before_registration_date}
                        onChange={handleChange}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Information Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Condition Information
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      About Offer Conditions
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
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
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: "",
                    min_age: null,
                    max_age: null,
                    gender: [],
                    city: [],
                    state: [],
                    country: [],
                    annual_income: null,
                    wealth: null,
                    nri: false,
                    applicable_plan_ids: [],
                    applicable_discount_ids: [],
                    applicable_device_codes: [],
                    plan_start_time_after_approval: null,
                    plan_end_time_after_approval: null,
                    timespan_reg_approval_gt: null,
                    timespan_reg_approval_lt: null,
                    plan_start_date: "",
                    plan_end_date: "",
                    registration_start_time: null,
                    registration_end_time: null,
                    after_approval_date: "",
                    before_approval_date: "",
                    after_registration_date: "",
                    before_registration_date: "",
                    is_active: true,
                  });
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Form
              </button>
              <Link
                href="/admin/dashboard/plans-section/offer-conditions"
                className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
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