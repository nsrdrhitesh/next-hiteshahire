// frontend-repo/src/app/admin/dashboard/device-type-fields/page.tsx
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft, Save, Search, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

// ---------- Logical fields grouped by category ----------
const FIELD_CATEGORIES = {
  "Personal / Basic": [
    "id", "mobile_no", "email", "profile_for", "gender", "first_name",
    "middle_name", "last_name", "date_of_birth", "introduction",
    "lens", "spectacles", "birth_time", "has_disability", "disability_details",
  ],
  "Religion & Culture": [
    "religion", "caste", "sub_caste", "sub_sub_caste", "mother_tongue",
  ],
  "Personal Details (Lookup)": [
    "height", "weight", "blood_group", "complexion", "marital_status",
    "have_child", "number_of_child", "birth_place",
  ],
  "Residence & Citizenship": [
    "citizenship", "currentResidence", "isAbroad", "is_nri", "isSameAsPermanent",
    "isReadyToRelocate", "permanent_city", "permanent_country", "permanent_state",
    "present_city", "present_country", "present_state", "visa_status", "visa_type",
  ],
  "Education & Profession": [
    "highest_education", "highestEducationOther", "specification", "specificationOther",
    "employment_type", "occupation", "business_type", "businessLocation",
    "designation", "companyName", "jobTitle", "work_mode", "workLocation",
    "annual_income", "total_wealth",
  ],
  "Partner Preferences (Single)": [
    "minAge", "maxAge", "min_height", "max_height", "manglik_status",
    "min_income", "max_income", "min_wealth", "max_wealth",
  ],
  "Partner Preferences (Multi)": [
    "preferred_religions", "preferred_castes", "preferred_mother_tongues",
    "preferred_marital_statuses", "preferred_educations", "preferred_occupations",
    "preferred_countries", "preferred_states", "preferred_cities",
  ],
  "Privacy Settings": [
    "album_privacy", "profile_visibility", "profile_picture_visibility",
    "contact_number_visibility", "which_contact_number_visibility",
    "video_call_setting", "show_in_search_results", "show_online_status",
  ],
  "Lifestyle": [
    "dietary_habit", "smoking_habit", "drinking_habit", "mother_tongue_lifestyle",
    "languages_known", "hobbies", "interests", "dress_styles", "sports",
    "favourite_music", "favourite_food",
  ],
  "Spiritual / Astro": [
    "manglik_status_spiritual", "ras", "nakshtra", "gan", "charan", "nadi", "gotra",
  ],
  "Family Details": [
    "father_name", "mother_name", "father_occupation", "mother_occupation",
    "number_of_brothers", "number_of_married_brothers", "number_of_sisters",
    "number_of_married_sisters", "parents_mobile_no", "family_type",
    "family_assets", "living_with_parents", "family_status", "manglik_status_family",
  ],
};

const ALL_FIELDS = Object.values(FIELD_CATEGORIES).flat();

interface DeviceType {
  id: number;
  platformId: string;
  deviceCode: string;
  deviceName: string;
  isActive: number;
}

type ConfigState = Record<string, boolean>;

export default function DeviceTypeFieldSelectorPage() {
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<number | null>(null);
  const [config, setConfig] = useState<ConfigState>({});
  const [loading, setLoading] = useState(false);
  const [loadingDeviceTypes, setLoadingDeviceTypes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(FIELD_CATEGORIES).forEach(cat => { initial[cat] = true; });
    return initial;
  });

  // Fetch device types on component mount
  useEffect(() => {
    const fetchDeviceTypes = async () => {
      setLoadingDeviceTypes(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoadingDeviceTypes(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/offer-conditions/device-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        
        if (json.success && json.data?.data) {
          // Filter only active device types
          const activeDeviceTypes = json.data.data.filter((d: DeviceType) => d.isActive === 1);
          setDeviceTypes(activeDeviceTypes);
          
          // Auto-select first device type if available
          if (activeDeviceTypes.length > 0 && selectedDeviceTypeId === null) {
            setSelectedDeviceTypeId(activeDeviceTypes[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load device types", error);
      } finally {
        setLoadingDeviceTypes(false);
      }
    };

    fetchDeviceTypes();
  }, []);

  // Load configuration when device type changes
  useEffect(() => {
    if (!selectedDeviceTypeId) return;

    const fetchConfig = async () => {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/member/device-type-fields?deviceTypeId=${selectedDeviceTypeId}&platformId=${parseInt(localStorage.getItem("selected_platform_id") || "0", 10)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        // const selectedFields: string[] = json.success ? json.data.selectedFields : [];
        const selectedFields: string[] =
            json.success && json.data?.data?.selected_fields
              ? json.data.data.selected_fields
              : [];

        const newConfig: ConfigState = {};
        ALL_FIELDS.forEach((field) => {
          newConfig[field] = selectedFields.includes(field);
        });
        setConfig(newConfig);
      } catch (error) {
        console.error("Failed to load device type fields config", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [selectedDeviceTypeId]);

  const handleToggle = (field: string) => {
    setConfig((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectAll = (categoryFields: string[]) => {
    const allSelected = categoryFields.every((f) => config[f]);
    const newConfig = { ...config };
    categoryFields.forEach((f) => {
      newConfig[f] = !allSelected;
    });
    setConfig(newConfig);
  };

  const handleSave = async () => {
    if (!selectedDeviceTypeId) {
      alert("Please select a device type first");
      return;
    }

    const selectedFields = Object.entries(config)
      .filter(([, selected]) => selected)
      .map(([key]) => key);

    setSaving(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/member/device-type-fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_type_id: selectedDeviceTypeId,
          platform_id: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
          selected_fields: selectedFields,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Configuration saved successfully!");
      } else {
        alert("Failed to save: " + (json.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Save error", error);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Filter categories based on search term
  const filteredCategories = Object.entries(FIELD_CATEGORIES).reduce(
    (acc, [cat, fields]) => {
      const filtered = fields.filter((f) =>
        f.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length) acc[cat] = filtered;
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Calculate statistics
  const totalSelected = Object.values(config).filter(Boolean).length;
  const totalFields = ALL_FIELDS.length;
  const selectedPercentage = totalFields > 0 ? Math.round((totalSelected / totalFields) * 100) : 0;

  // Highlight search term in text
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Get device type icon based on device code
  const getDeviceTypeIcon = (deviceCode: string) => {
    if (deviceCode.includes('ios')) return '📱';
    if (deviceCode.includes('android')) return '🤖';
    if (deviceCode.includes('web')) return '💻';
    return '🔧';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Wise Field Selector"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Device Type Fields" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/members",
            label: "Back to Members",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700 dark:text-gray-300">
              Device Type:
            </label>
            {loadingDeviceTypes ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-500">Loading device types...</span>
              </div>
            ) : (
              <select
                value={selectedDeviceTypeId || ""}
                onChange={(e) => setSelectedDeviceTypeId(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                  border-gray-300 dark:border-gray-600 min-w-[200px]"
              >
                <option value="">Select a device type</option>
                    {deviceTypes
                    .filter(device => device.platformId === localStorage.getItem("selected_platform_id"))
                    .map(device => (
                        <option key={device.id} value={device.id}>
                        {getDeviceTypeIcon(device.deviceCode)} {device.deviceName} ({device.deviceCode})
                        </option>
                    ))
                    }
              </select>
            )}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                border-gray-300 dark:border-gray-600"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !selectedDeviceTypeId}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>

        {/* No device type selected */}
        {!selectedDeviceTypeId && !loadingDeviceTypes && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Select a Device Type
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please select a device type from the dropdown above to configure its field visibility.
            </p>
          </div>
        )}

        {/* Statistics Card - Only show when device type is selected */}
        {selectedDeviceTypeId && !loading && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Fields</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSelected} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ {totalFields}</span>
                </p>
              </div>
              <div className="flex-1 max-w-md">
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${selectedPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedPercentage}% of all fields</p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="inline h-4 w-4 mr-1 text-green-500" />
                Fields will be visible in member details API for this device type
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && selectedDeviceTypeId && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Field groups */}
        {!loading && selectedDeviceTypeId && (
          <div className="space-y-4">
            {Object.entries(filteredCategories).map(([category, fields]) => {
              const categorySelectedCount = fields.filter(f => config[f]).length;
              const isExpanded = expandedCategories[category];
              
              return (
                <div
                  key={category}
                  className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Category Header */}
                  <div 
                    className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{category}</h3>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                        {categorySelectedCount} / {fields.length} selected
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAll(fields);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      {fields.every((f) => config[f]) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Category Content */}
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {fields.map((field) => (
                        <label
                          key={field}
                          className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
                        >
                          <input
                            type="checkbox"
                            checked={config[field] || false}
                            onChange={() => handleToggle(field)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 
                              dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {highlightText(field, searchTerm)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && selectedDeviceTypeId && Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No fields match your search.</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}