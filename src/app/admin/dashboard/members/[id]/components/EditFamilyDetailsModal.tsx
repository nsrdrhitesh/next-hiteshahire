"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";
import SearchableSelect from "@/app/admin/dashboard/components/ui/SearchableSelect";
import MultiSelectSearch from "./MultiSelectSearch";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface Option {
  id: string;
  name: string;
  isGroup?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

const fetchGroupedOptions = async (endpoint: string, search = "") => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`);
    const json = await res.json();
    if (!json.success) return { data: [], hasNextPage: false };
    
    const items = json.data?.data || [];
    const options: Option[] = [];
    const groups = new Map<string, boolean>();
    
    items.forEach((item: any) => {
      const groupName = item.educationGroup?.name || item.specializationGroup?.name || item.occupationGroup?.name;
      if (groupName && !groups.has(groupName)) {
        groups.set(groupName, true);
        options.push({ id: `group-${groupName}`, name: groupName, isGroup: true });
      }
      options.push({ id: String(item.id), name: item.name });
    });
    
    return { data: options, hasNextPage: json.data?.meta?.hasNextPage ?? false };
  } catch (err) {
    return { data: [], hasNextPage: false };
  }
};

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

export default function EditFamilyDetailsModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    father_name: "",
    mother_name: "",
    manglikStatusId: "",
    fatherOccupationId: "",
    motherOccupationId: "",
    numberOfBrothersId: "",
    numberOfMarriedBrothersId: "",
    numberOfSistersId: "",
    numberOfMarriedSistersId: "",
    // mobile_no: "", 
    parents_mobile_no: "",
    familyTypeId: "",
    // familyAssetsId: "",
    livingWithParentsId: "",
    familyStatusId: "",
    familyAssetsId: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  // const [hasSubCastes, setHasSubCastes] = useState(false);
  // const [hasSubSubCastes, setHasSubSubCastes] = useState(false);
  const [religions, setReligions] = useState<Option[]>([]);

  const fetchFamilyType = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/family-type?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const handleMultiChange = (field: keyof typeof formData, selected: string[]) => {
    setFormData(prev => ({ ...prev, [field]: selected }));
  };

  const fetchLivingWithParents = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/living-with-parents?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchFamilyAssets = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/family-assets?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchFamilyStatus = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/family-status?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const fetchManglikStatuses = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/manglik?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  useEffect(() => {
    const fetchAll = async () => {
      const [
        rels,
      ] = await Promise.all([
        fetchOptions("member-get/family-assets"),
      ]);
      setReligions(rels);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        father_name: initialData.father_name || "",
        mother_name: initialData.mother_name || "",
        manglikStatusId: initialData.manglik_status_family_id?.toString() || initialData.manglikStatusId?.toString() || "",
        fatherOccupationId: initialData.father_occupation_id?.toString() || "",
        motherOccupationId: initialData.mother_occupation_id?.toString() || "",
        numberOfBrothersId: initialData.number_of_brothers_id?.toString() || "",
        numberOfMarriedBrothersId: initialData.number_of_married_brothers_id?.toString() || "",
        numberOfSistersId: initialData.number_of_sisters_id?.toString() || "",
        numberOfMarriedSistersId: initialData.number_of_married_sisters_id?.toString() || "",
        parents_mobile_no: initialData.parents_mobile_no || "",
        familyTypeId: initialData.family_type_id?.toString() || "",
        livingWithParentsId: initialData.living_with_parents_id?.toString() || "",
        familyStatusId: initialData.family_status_id?.toString() || "",
        familyAssetsId: initialData.family_assets_names 
          ? initialData.family_assets_names.map((a: any) => String(a.id))
          : (initialData.family_assets_ids ? initialData.family_assets_ids.split(',').map((id: string) => id.trim()) : []),
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
  
    try {
      const payload = {
        member_id: Number(memberId),               // matches DTO: member_id
        father_name: formData.father_name || null,
        mother_name: formData.mother_name || null,
        manglik_status_id: formData.manglikStatusId ? Number(formData.manglikStatusId) : null,
        father_occupation_id: formData.fatherOccupationId ? Number(formData.fatherOccupationId) : null,
        mother_occupation_id: formData.motherOccupationId ? Number(formData.motherOccupationId) : null,
        number_of_brothers_id: formData.numberOfBrothersId ? Number(formData.numberOfBrothersId) : null,
        number_of_married_brothers_id: formData.numberOfMarriedBrothersId ? Number(formData.numberOfMarriedBrothersId) : null,
        number_of_sisters_id: formData.numberOfSistersId ? Number(formData.numberOfSistersId) : null,
        number_of_married_sisters_id: formData.numberOfMarriedSistersId ? Number(formData.numberOfMarriedSistersId) : null,
        parents_mobile_no: formData.parents_mobile_no || null,
        family_type_id: formData.familyTypeId ? Number(formData.familyTypeId) : null,
        family_assets_ids: formData.familyAssetsId.length ? formData.familyAssetsId.map(id => Number(id)) : null,
        living_with_parents_id: formData.livingWithParentsId ? Number(formData.livingWithParentsId) : null,
        family_status_id: formData.familyStatusId ? Number(formData.familyStatusId) : null,
      };
    
      const response = await fetch(`${API_URL}/member/member-family-detail`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
    
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
    
      showSuccess("Family details updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Sticky Title */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Family Details</h2>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4 py-6">
                        
            <div>
              <label className="block text-sm font-semibold mb-2">Father Name *</label>
              <input
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Mother Name *</label>
              <input
                name="mother_name"
                value={formData.mother_name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>

            <SearchableSelect
              label="Father Occupation"
              value={formData.fatherOccupationId}
              onChange={(val) => setFormData(prev => ({ ...prev, fatherOccupationId: val }))}
              fetchOptions={(search) => fetchGroupedOptions("member-get/occupation", search)}
            />
              
            <SearchableSelect
              label="Mother Occupation"
              value={formData.motherOccupationId}
              onChange={(val) => setFormData(prev => ({ ...prev, motherOccupationId: val }))}
              fetchOptions={(search) => fetchGroupedOptions("member-get/occupation", search)}
            />

            <SearchableSelect
              label="No. of Brothers"
              value={formData.numberOfBrothersId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, numberOfBrothersId: val, numberOfBrothersName: opt?.name || "" }))}
              fetchOptions={fetchNumberOfChild}
            />

            <SearchableSelect
              label="No. of Married Brothers"
              value={formData.numberOfMarriedBrothersId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, numberOfMarriedBrothersId: val, numberOfMarriedBrothersName: opt?.name || "" }))}
              fetchOptions={fetchNumberOfChild}
            />

            <SearchableSelect
              label="No. of Sisters"
              value={formData.numberOfSistersId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, numberOfSistersId: val, numberOfSistersName: opt?.name || "" }))}
              fetchOptions={fetchNumberOfChild}
            />

            <SearchableSelect
              label="No. of Married Sisters"
              value={formData.numberOfMarriedSistersId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, numberOfMarriedSistersId: val, numberOfMarriedSistersName: opt?.name || "" }))}
              fetchOptions={fetchNumberOfChild}
            />

            <div>
              <label className="block text-sm font-semibold mb-2">Mobile Number *</label>
              <input
                type="tel"
                name="parents_mobile_no"
                value={formData.parents_mobile_no}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>

            <SearchableSelect
              label="Family Type"
              value={formData.familyTypeId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, familyTypeId: val, familyTypeName: opt?.name || "" }))}
              fetchOptions={fetchFamilyType}
            />

            {/* <SearchableSelect
              label="Family Assets"
              value={formData.familyAssetsId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, familyAssetsId: val, familyAssetsName: opt?.name || "" }))}
              fetchOptions={fetchFamilyAssets}
            /> */}

            <MultiSelectSearch
              label="Family Assets"
              options={religions}
              selected={formData.familyAssetsId}
              onChange={(sel) => handleMultiChange("familyAssetsId", sel)}
              required
            />

            <SearchableSelect
              label="Living With Parents"
              value={formData.livingWithParentsId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, livingWithParentsId: val, livingWithParentsName: opt?.name || "" }))}
              fetchOptions={fetchLivingWithParents}
            />

            <SearchableSelect
              label="Family Status"
              value={formData.familyStatusId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, familyStatusId: val, familyStatusName: opt?.name || "" }))}
              fetchOptions={fetchFamilyStatus}
            />
          </form>
        </div>
        
        {/* Fixed Buttons at Bottom - outside the scrollable area */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900 rounded-b-2xl">
        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading} 
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}