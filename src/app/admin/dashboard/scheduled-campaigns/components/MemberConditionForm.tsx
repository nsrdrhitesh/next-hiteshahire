"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Smartphone,
  CheckCircle,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { showSuccess, showError } from "../../lib/swalHelper";
import FormField from "../../components/ui/fields/InputField";
import MemberConditionDynamicFields from "./MemberConditionDynamicFields";

interface MemberConditionFormProps {
  mode: "create" | "edit";
  initialData?: any;
  conditionId?: string;
}

type Section = 'basic' | 'demographics' | 'location' | 'education' | 'dates' | 'status';

export default function MemberConditionForm({
  mode,
  initialData,
  conditionId,
}: MemberConditionFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [expandedSections, setExpandedSections] = useState<Record<Section, boolean>>({
    basic: true,
    demographics: true,
    location: false,
    education: false,
    dates: false,
    status: false,
  });

  // Dynamic Options
  const [dynamicOptions, setDynamicOptions] = useState({
    genderOptions: [] as any[],
    onBehalfOptions: [] as any[],
    maritalStatusOptions: [] as any[],
    deviceTypeOptions: [] as any[],
    planOptions: [] as any[],
    religions: [] as any[],
    countries: [] as any[],
    casteGroups: [] as any[],
    educationGroups: [] as any[],
    occupationGroups: [] as any[],
  });

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "2", 10),
    name: "",
    gender: [] as number[],
    onBehalf: [] as number[],
    country: [] as number[],
    state: [] as number[],
    city: [] as number[],
    religion: [] as number[],
    caste: [] as number[],
    occupation: [] as number[],
    education: [] as number[],
    memberDeviceType: [] as number[],
    approveStatus: [] as number[],
    planPurchased: [] as number[],
    approveFromDate: "",
    approveToDate: "",
    memberFromDate: "",
    memberToDate: "",
    memberIncompleteFrom: [] as number[],
    maritalStatus: [] as number[],
    memberAgeMin: 0,
    memberAgeMax: 0,
    isActive: 1,
  });

  // ==================== FETCH ALL DYNAMIC OPTIONS ====================
  useEffect(() => {
    const platformId = parseInt(localStorage.getItem("selected_platform_id") || "2", 10);

    const fetchAllOptions = async () => {
      try {
        const [
          genderRes,
          onBehalfRes,
          maritalRes,
          deviceRes,
          planRes,
          religionRes,
          countryRes,
          educationRes,
          occupationRes,
        ] = await Promise.all([
          fetch(`${API_URL}/member-get/gender`),
          fetch(`${API_URL}/member-get/on-behalf`),
          fetch(`${API_URL}/member-get/marital-status?search=`),
          fetch(`${API_URL}/offer-conditions/device-types?platformId=${platformId}`),
          fetch(`${API_URL}/plans?page=1&limit=50&platformId=${platformId}`),
          fetch(`${API_URL}/member-get/religion`),
          fetch(`${API_URL}/member-get/countries`),
          fetch(`${API_URL}/member-get/education`),
          fetch(`${API_URL}/member-get/occupation`),
        ]);

        const genderData = await genderRes.json();
        const onBehalfData = await onBehalfRes.json();
        const maritalData = await maritalRes.json();
        const deviceData = await deviceRes.json();
        const planData = await planRes.json();
        const religionData = await religionRes.json();
        const countryData = await countryRes.json();
        const educationData = await educationRes.json();
        const occupationData = await occupationRes.json();

        // Group Education
        const educationGroups: any[] = [];
        if (educationData.success) {
          const map = new Map<string, any[]>();
          educationData.data.data.forEach((item: any) => {
            const groupName = item.educationGroup?.name || "Others";
            if (!map.has(groupName)) map.set(groupName, []);
            map.get(groupName)!.push({
              id: String(item.id),
              name: item.name?.trim() || "Unnamed",
            });
          });
          Array.from(map.entries()).forEach(([groupName, options]) => {
            educationGroups.push({
              groupName,
              options: options.sort((a: any, b: any) => a.name.localeCompare(b.name)),
            });
          });
        }

        // Group Occupation
        const occupationGroups: any[] = [];
        if (occupationData.success) {
          const map = new Map<string, any[]>();
          occupationData.data.data.forEach((item: any) => {
            const groupName = item.occupationGroup?.name || "Others";
            if (!map.has(groupName)) map.set(groupName, []);
            map.get(groupName)!.push({
              id: String(item.id),
              name: item.name?.trim() || "Unnamed",
            });
          });
          Array.from(map.entries()).forEach(([groupName, options]) => {
            occupationGroups.push({
              groupName,
              options: options.sort((a: any, b: any) => a.name.localeCompare(b.name)),
            });
          });
        }

        setDynamicOptions({
          genderOptions: genderData.data?.data || [],
          onBehalfOptions: onBehalfData.data?.data || [],
          maritalStatusOptions: maritalData.data?.data?.map((item: any) => ({
            id: String(item.id),
            name: item.name_en || item.name,
          })) || [],
          deviceTypeOptions: deviceData.data?.data || [],
          planOptions: planData.data?.data?.map((p: any) => ({
            id: String(p.id),
            name: p.name,
          })) || [],
          religions: religionData.data?.data?.map((r: any) => ({
            id: String(r.id),
            name: r.name || r.religion_name || "Unnamed",
          })) || [],
          countries: countryData.data?.data?.map((c: any) => ({
            id: String(c.id || c.countryId),
            name: c.name || c.country_name || "Unnamed",
          })) || [],
          educationGroups,
          occupationGroups,
          casteGroups: [],
        });
      } catch (err) {
        console.error("Failed to load dynamic options:", err);
      }
    };

    fetchAllOptions();
  }, []);

  // ==================== FETCH CASTE GROUPS WHEN RELIGION CHANGES ====================
  useEffect(() => {
    const fetchCasteGroups = async () => {
      if (formData.religion.length === 0) {
        setDynamicOptions((prev) => ({ ...prev, casteGroups: [] }));
        return;
      }

      try {
        const groups = await Promise.all(
          formData.religion.map(async (relId: number) => {
            const res = await fetch(`${API_URL}/member-get/castes/religion/${relId}/main`);
            const json = await res.json();
            const relName =
              dynamicOptions.religions.find((r: any) => String(r.id) === String(relId))?.name || "Unknown Religion";

            return {
              religionId: String(relId),
              religionName: relName,
              castes: json.data?.data?.map((c: any) => ({
                id: String(c.id),
                name: c.name || c.caste_name || "Unnamed",
              })) || [],
            };
          })
        );
        setDynamicOptions((prev) => ({ ...prev, casteGroups: groups }));
      } catch (err) {
        console.error("Failed to fetch caste groups:", err);
      }
    };

    fetchCasteGroups();
  }, [formData.religion, dynamicOptions.religions]);

  // ==================== LOAD INITIAL DATA FOR EDIT MODE ====================
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        platformId: initialData.platformId || parseInt(localStorage.getItem("selected_platform_id") || "2", 10),
        name: initialData.name || "",
        gender: initialData.gender || [],
        onBehalf: initialData.onBehalf || [],
        country: initialData.country || [],
        state: initialData.state || [],
        city: initialData.city || [],
        religion: initialData.religion || [],
        caste: initialData.caste || [],
        occupation: initialData.occupation || [],
        education: initialData.education || [],
        memberDeviceType: initialData.memberDeviceType || [],
        approveStatus: initialData.approveStatus || [],
        planPurchased: initialData.planPurchased || [],
        approveFromDate: initialData.approveFromDate || "",
        approveToDate: initialData.approveToDate || "",
        memberFromDate: initialData.memberFromDate || "",
        memberToDate: initialData.memberToDate || "",
        memberIncompleteFrom: initialData.memberIncompleteFrom || [],
        maritalStatus: initialData.maritalStatus || [],
        memberAgeMin: initialData.memberAgeMin || 0,
        memberAgeMax: initialData.memberAgeMax || 0,
        isActive: initialData.isActive ?? 1,
      });
    }
  }, [mode, initialData]);

  const toggleSection = (section: Section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked ? 1 : 0
        : type === "number"
        ? parseInt(value) || 0
        : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Condition name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    if (formData.memberAgeMin > 0 && formData.memberAgeMax > 0 && formData.memberAgeMin > formData.memberAgeMax) {
      newErrors.memberAgeMin = "Minimum age cannot be greater than maximum age";
    }
    if (formData.approveFromDate && formData.approveToDate && new Date(formData.approveFromDate) > new Date(formData.approveToDate)) {
      newErrors.approveToDate = "Approval end date must be after start date";
    }
    if (formData.memberFromDate && formData.memberToDate && new Date(formData.memberFromDate) > new Date(formData.memberToDate)) {
      newErrors.memberToDate = "Member end date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = mode === "create"
        ? `${API_URL}/scheduled-campaigns/member-conditions`
        : `${API_URL}/scheduled-campaigns/member-conditions/${conditionId}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const submissionData = {
        ...formData,
        memberAgeMin: formData.memberAgeMin || 0,
        memberAgeMax: formData.memberAgeMax || 0,
      };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
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
          showError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setLoading(false);
        return;
      }

      await showSuccess(`Member condition ${mode === "create" ? "created" : "updated"} successfully`);
      router.push("/admin/dashboard/scheduled-campaigns/member-condition");
      router.refresh();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      showError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ section, title, icon: Icon }: { section: Section; title: string; icon: any }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left dark:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-purple-500" />
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Section */}
          <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <SectionHeader section="basic" title="Basic Information" icon={Users} />
            {expandedSections.basic && (
              <div className="p-6 space-y-4">
                <FormField
                  label="Condition Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Active Brides, Premium Grooms"
                  required
                  error={errors.name}
                />

                <MemberConditionDynamicFields
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  religions={dynamicOptions.religions}
                  countries={dynamicOptions.countries}
                  casteGroups={dynamicOptions.casteGroups}
                  educationGroups={dynamicOptions.educationGroups}
                  occupationGroups={dynamicOptions.occupationGroups}
                  genderOptions={dynamicOptions.genderOptions}
                  onBehalfOptions={dynamicOptions.onBehalfOptions}
                  maritalStatusOptions={dynamicOptions.maritalStatusOptions}
                  deviceTypeOptions={dynamicOptions.deviceTypeOptions}
                  planOptions={dynamicOptions.planOptions}
                />
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <SectionHeader section="dates" title="Date Ranges" icon={Calendar} />
            {expandedSections.dates && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Approval From Date"
                    name="approveFromDate"
                    type="date"
                    value={formData.approveFromDate}
                    onChange={handleChange}
                    error={errors.approveFromDate}
                  />
                  <FormField
                    label="Approval To Date"
                    name="approveToDate"
                    type="date"
                    value={formData.approveToDate}
                    onChange={handleChange}
                    error={errors.approveToDate}
                  />
                  <FormField
                    label="Member From Date"
                    name="memberFromDate"
                    type="date"
                    value={formData.memberFromDate}
                    onChange={handleChange}
                    error={errors.memberFromDate}
                  />
                  <FormField
                    label="Member To Date"
                    name="memberToDate"
                    type="date"
                    value={formData.memberToDate}
                    onChange={handleChange}
                    error={errors.memberToDate}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <SectionHeader section="status" title="Status Filters" icon={CheckCircle} />
            {expandedSections.status && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Approval Status
                    </label>
                    <div className="flex gap-4">
                      {[1, 2].map((val, idx) => (
                        <label key={val} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.approveStatus.includes(val)}
                            onChange={() => {
                              const newVal = formData.approveStatus.includes(val)
                                ? formData.approveStatus.filter((v: number) => v !== val)
                                : [...formData.approveStatus, val];
                              setFormData((prev) => ({ ...prev, approveStatus: newVal }));
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {idx === 0 ? "Approved" : "Pending"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Incomplete Steps (IDs)
                    </label>
                    <input
                      type="text"
                      value={formData.memberIncompleteFrom.join(',')}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          memberIncompleteFrom: e.target.value
                            .split(',')
                            .filter((v: string) => v.trim())
                            .map((v: string) => parseInt(v.trim())),
                        }))
                      }
                      placeholder="e.g., 1,2,3"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">Users with incomplete profile steps</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Condition Information</h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Leave fields empty to include all values</li>
                  <li>• Multiple selections use OR logic</li>
                  <li>• Date ranges are inclusive</li>
                  <li>• Age range filters members by age</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Important Notes</h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• All ID fields accept comma-separated values</li>
                  <li>• IDs must exist in respective master tables</li>
                  <li>• Test conditions before using in campaigns</li>
                  <li>• Conditions are combined with AND logic</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Example Use Cases</h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Brides in Mumbai:</strong> Gender=Bride, City=Mumbai ID</p>
              <p><strong>Premium Grooms:</strong> Gender=Groom, Plan=Premium ID</p>
              <p><strong>New Members:</strong> Member date last 30 days</p>
              <p><strong>Pending Approval:</strong> Approval Status=Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/dashboard/scheduled-campaigns/member-condition"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Condition"
            : "Update Condition"}
        </button>
      </div>
    </form>
  );
}