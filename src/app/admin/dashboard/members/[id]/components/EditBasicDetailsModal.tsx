"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";
import SearchableSelect from "@/app/admin/dashboard/components/ui/SearchableSelect";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

export default function EditBasicDetailsModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    heightId: "",
    weightId: "",
    heightName: "",
    weightName: "",
    bloodGroupId: "",
    complexionId: "",
    bloodGroupName: "",
    complexionName: "",
    maritalStatusId: "",
    maritalStatusName: "",
    birthTime: "",
    birthPlaceId: "",
    birthPlaceName: "",
    hasDisability: "no",
    lens: "no",
    spectacles: "no",
    disabilityDetails: "",
    haveChildId: "",
    haveChildName: "",
    numberOfChildId: "",
    numberOfChildName: "",
  });
  const [loading, setLoading] = useState(false);

  // API helpers matching your basic-form
  const fetchHeights = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/height?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({
        id: String(item.id),
        name: `${item.ft_value} (${item.cm_value} cm)`,
      })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchBloodGroups = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/blood-group?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchComplexions = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/complexion?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchWeights = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/weight?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchMaritalStatuses = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/marital-status?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name_en })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchCities = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/city?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.city_id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchHaveChild = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/have-childs?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  const fetchNumberOfChild = async (search: string, page: number = 1) => {
    const res = await fetch(`${API_URL}/member-get/no-of-childs?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      meta: {
        hasNextPage: false,
        total: items.length,
      },
    };
  };

  useEffect(() => {
    if (initialData) {
      console.log("Initial Data:", initialData);
      
      // Fix: Map birth_place_id and birth_place_name correctly
      const birthPlaceIdValue = initialData.birth_place_id ? String(initialData.birth_place_id) : "";
      const birthPlaceNameValue = initialData.birth_place_name || "";
      
      setFormData({
        heightId: initialData.height_id ? String(initialData.height_id) : "",
        weightId: initialData.weight_id ? String(initialData.weight_id) : "",
        heightName: initialData.height_name || "",
        weightName: initialData.weight_name || "",
        bloodGroupId: initialData.blood_group_id ? String(initialData.blood_group_id) : "",
        complexionId: initialData.complexion_id ? String(initialData.complexion_id) : "",
        bloodGroupName: initialData.blood_group_name || "",
        complexionName: initialData.complexion_name || "",
        maritalStatusId: initialData.marital_status_id ? String(initialData.marital_status_id) : "",
        maritalStatusName: initialData.marital_status_name || "",
        birthTime: initialData.birth_time || "",
        birthPlaceId: birthPlaceIdValue,
        birthPlaceName: birthPlaceNameValue,
        hasDisability: initialData.has_disability === 1 ? "yes" : "no",
        lens: initialData.lens === 1 ? "yes" : "no",
        spectacles: initialData.spectacles === 1 ? "yes" : "no",
        disabilityDetails: initialData.disability_details || "",
        haveChildId: initialData.have_child_id ? String(initialData.have_child_id) : "",
        haveChildName: initialData.have_child_name || "",
        numberOfChildId: initialData.number_of_child_id ? String(initialData.number_of_child_id) : "",
        numberOfChildName: initialData.number_of_child_name || "",
      });
      
      console.log("Form Data after setting:", {
        birthPlaceId: birthPlaceIdValue,
        birthPlaceName: birthPlaceNameValue,
      });
    }
  }, [initialData]);

  const maritalStatusNeedsChildren = ["2", "3", "4", "5", "6"].includes(formData.maritalStatusId);
  const showNumberOfChildren = maritalStatusNeedsChildren && ["2", "3"].includes(formData.haveChildId);

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      hasDisability: e.target.value,
      disabilityDetails: e.target.value === "no" ? "" : prev.disabilityDetails,
    }));
  };

  const handleRadioChangeLens = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      lens: e.target.value,
    }));
  };

  const handleRadioChangeSpectacles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      spectacles: e.target.value,
    }));
  };

  const handleBirthPlaceChange = (val: string, opt: any) => {
    console.log("Birth Place Changed - Value:", val, "Option:", opt);
    setFormData(prev => ({
      ...prev,
      birthPlaceId: val,
      birthPlaceName: opt?.name || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    // Debug: Log current formData before submission
    console.log("Current formData before submission:", {
      birthPlaceId: formData.birthPlaceId,
      birthPlaceName: formData.birthPlaceName,
      type: typeof formData.birthPlaceId,
      value: formData.birthPlaceId
    });
    
    // Ensure birthPlaceId is properly converted to number
    let birthPlaceIdNumber = null;
    if (formData.birthPlaceId && formData.birthPlaceId !== "") {
      birthPlaceIdNumber = Number(formData.birthPlaceId);
      if (isNaN(birthPlaceIdNumber)) {
        console.error("Invalid birthPlaceId:", formData.birthPlaceId);
        showError("Invalid birth place selected");
        setLoading(false);
        return;
      }
    }
    
    console.log("Birth Place ID Number:", birthPlaceIdNumber);
    
    try {
      const payload = {
        member_id: Number(memberId),
        height_id: formData.heightId ? Number(formData.heightId) : 0,
        weight_id: formData.weightId ? Number(formData.weightId) : 0,
        blood_group_id: formData.bloodGroupId ? Number(formData.bloodGroupId) : 0,
        complexion_id: formData.complexionId ? Number(formData.complexionId) : 0,
        marital_status_id: formData.maritalStatusId ? Number(formData.maritalStatusId) : 0,
        birth_place_id: birthPlaceIdNumber,
        birth_time: formData.birthTime,
        has_disability: formData.hasDisability === "yes" ? 1 : 0,
        disability_details: formData.hasDisability === "yes" ? formData.disabilityDetails : "",
        lens: formData.lens === "yes" ? 1 : 0,
        spectacles: formData.spectacles === "yes" ? 1 : 0,
        have_child_id: formData.haveChildId ? Number(formData.haveChildId) : 0,
        number_of_child_id: formData.numberOfChildId ? Number(formData.numberOfChildId) : 0,
      };
      
      console.log("Final payload:", payload);
      
      const response = await fetch(`${API_URL}/member/member-personal-basic`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
      
      showSuccess("Basic details updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Update error:", err);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Basic Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            label="Height"
            value={formData.heightId}
            onChange={(val, opt) => setFormData(prev => ({ ...prev, heightId: val, heightName: opt?.name || "" }))}
            fetchOptions={fetchHeights}
            required
          />

          <SearchableSelect
            label="Blood Group"
            value={formData.bloodGroupId}
            onChange={(val, opt) => setFormData(prev => ({ ...prev, bloodGroupId: val, bloodGroupName: opt?.name || "" }))}
            fetchOptions={fetchBloodGroups}
            required
          />

          <SearchableSelect
            label="Complexion"
            value={formData.complexionId}
            onChange={(val, opt) => setFormData(prev => ({ ...prev, complexionId: val, complexionName: opt?.name || "" }))}
            fetchOptions={fetchComplexions}
          />

          <div>
            <label className="block text-sm font-semibold mb-3">Physical Disability *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="hasDisability" value="no" checked={formData.hasDisability === "no"} onChange={handleRadioChange} />
                No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="hasDisability" value="yes" checked={formData.hasDisability === "yes"} onChange={handleRadioChange} />
                Yes
              </label>
            </div>
            {formData.hasDisability === "yes" && (
              <textarea
                name="disabilityDetails"
                value={formData.disabilityDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, disabilityDetails: e.target.value }))}
                placeholder="Please mention disability details..."
                rows={3}
                className="w-full rounded-xl border px-4 py-2 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Lens </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="lens" value="no" checked={formData.lens === "no"} onChange={handleRadioChangeLens} />
                No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="lens" value="yes" checked={formData.lens === "yes"} onChange={handleRadioChangeLens} />
                Yes
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">Spectacles </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="radio" name="spectacles" value="no" checked={formData.spectacles === "no"} onChange={handleRadioChangeSpectacles} />
                No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="spectacles" value="yes" checked={formData.spectacles === "yes"} onChange={handleRadioChangeSpectacles} />
                Yes
              </label>
            </div>
          </div>

          <SearchableSelect
            label="Marital Status"
            value={formData.maritalStatusId}
            onChange={(val, opt) => {
              setFormData(prev => ({
                ...prev,
                maritalStatusId: val,
                maritalStatusName: opt?.name || "",
                haveChildId: "",
                haveChildName: "",
                numberOfChildId: "",
                numberOfChildName: "",
              }));
            }}
            fetchOptions={fetchMaritalStatuses}
            required
          />

          {maritalStatusNeedsChildren && (
            <SearchableSelect
              label="Have Children"
              value={formData.haveChildId}
              onChange={(val, opt) => {
                setFormData(prev => ({
                  ...prev,
                  haveChildId: val,
                  haveChildName: opt?.name || "",
                  numberOfChildId: "",
                  numberOfChildName: "",
                }));
              }}
              fetchOptions={fetchHaveChild}
            />
          )}

          {showNumberOfChildren && (
            <SearchableSelect
              label="Number of Children"
              value={formData.numberOfChildId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, numberOfChildId: val, numberOfChildName: opt?.name || "" }))}
              fetchOptions={fetchNumberOfChild}
            />
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Birth Time *</label>
            <input
              type="time"
              name="birthTime"
              value={formData.birthTime}
              onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2"
              required
            />
          </div>

          <SearchableSelect
            label="Birth Place"
            value={formData.birthPlaceId}
            initialLabel={formData.birthPlaceName}
            onChange={handleBirthPlaceChange}
            fetchOptions={fetchCities}
            required
          />

          <SearchableSelect
            label="Weight"
            value={formData.weightId}
            onChange={(val, opt) => setFormData(prev => ({ ...prev, weightId: val, weightName: opt?.name || "" }))}
            fetchOptions={fetchWeights}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-xl">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}