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

export default function EditReligionModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
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
  });
  const [loading, setLoading] = useState(false);
  const [hasSubCastes, setHasSubCastes] = useState(false);
  const [hasSubSubCastes, setHasSubSubCastes] = useState(false);

  // API helpers matching your religion-form
  const fetchReligions = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/religion?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchMainCastes = async (search: string) => {
    console.log("Okay Test",formData.religionId);
    if (!formData.religionId) return { data: [], hasNextPage: false };
    console.log("Okay Test",formData.religionId);
    const res = await fetch(`${API_URL}/member-get/castes/religion/${formData.religionId}/main?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchSubCastes = async (search: string) => {
    console.log("Okay Test",formData.casteId);
    if (!formData.casteId) return { data: [], hasNextPage: false };
    console.log("Okay Test",formData.casteId);

    const res = await fetch(`${API_URL}/member-get/castes/sub/${formData.casteId}?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    setHasSubCastes(items.length > 0);
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchSubSubCastes = async (search: string) => {
    if (!formData.subCasteId) return { data: [], hasNextPage: false };
    const res = await fetch(`${API_URL}/member-get/castes/sub-sub/${formData.subCasteId}?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    setHasSubSubCastes(items.length > 0);
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchMotherTongues = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/language?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        religionId: initialData.religion_id || "",
        religionName: initialData.religion_name || "",
        casteId: initialData.caste_id || "",
        casteName: initialData.caste_name || "",
        subCasteId: initialData.sub_caste_id || "",
        subCasteName: initialData.sub_caste_name || "",
        subSubCasteId: initialData.sub_sub_caste_id || "",
        subSubCasteName: initialData.sub_sub_caste_name || "",
        motherTongueId: initialData.mother_tongue_id || "",
        motherTongueName: initialData.mother_tongue_name || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const payload = {
        member_id: Number(memberId),
        religion_id: Number(formData.religionId),
        caste_id: formData.casteId ? Number(formData.casteId) : 0,
        sub_caste_id: formData.subCasteId ? Number(formData.subCasteId) : 0,
        sub_sub_caste_id: formData.subSubCasteId ? Number(formData.subSubCasteId) : 0,
        mother_tongue_id: Number(formData.motherTongueId),
      };
      
      const response = await fetch(`${API_URL}/member/member-religion`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
      
      showSuccess("Religion & Community details updated successfully!");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Religion & Community</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            label="Religion"
            value={formData.religionId}
            onChange={(val, opt) => {
              setFormData({
                ...formData,
                religionId: val,
                religionName: opt?.name || "",
                casteId: "",
                casteName: "",
                subCasteId: "",
                subCasteName: "",
                subSubCasteId: "",
                subSubCasteName: "",
              });
            }}
            fetchOptions={fetchReligions}
            required
          />

          {formData.religionId && (
            <SearchableSelect
              label="Caste"
              value={formData.casteId}
              onChange={(val, opt) => {
                setFormData({
                  ...formData,
                  casteId: val,
                  casteName: opt?.name || "",
                  subCasteId: "",
                  subCasteName: "",
                  subSubCasteId: "",
                  subSubCasteName: "",
                });
              }}
              fetchOptions={fetchMainCastes}
              required
            />
          )}

          {formData.casteId  && (
            <SearchableSelect
              label="Sub Caste (Optional)"
              value={formData.subCasteId}
              onChange={(val, opt) => {
                setFormData({
                  ...formData,
                  subCasteId: val,
                  subCasteName: opt?.name || "",
                  subSubCasteId: "",
                  subSubCasteName: "",
                });
              }
            }
              fetchOptions={fetchSubCastes}
            />
          )}

          {formData.subCasteId && (
            <SearchableSelect
              label="Sub-Sub Caste (Optional)"
              value={formData.subSubCasteId}
              onChange={(val, opt) => {
                setFormData({
                  ...formData,
                  subSubCasteId: val,
                  subSubCasteName: opt?.name || "",
                });
              }}
              fetchOptions={fetchSubSubCastes}
            />
          )}

          <SearchableSelect
            label="Mother Tongue"
            value={formData.motherTongueId}
            onChange={(val, opt) => {
              setFormData({
                ...formData,
                motherTongueId: val,
                motherTongueName: opt?.name || "",
              });
            }}
            fetchOptions={fetchMotherTongues}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}