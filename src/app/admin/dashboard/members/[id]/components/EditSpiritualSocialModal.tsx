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

export default function EditSpiritualSocialModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    manglikStatusId: "",
    rasId: "",
    nakshtraId: "",
    ganId: "",
    charanId: "",
    nadiId: "",
    gotraId: "" 
  });
  const [loading, setLoading] = useState(false);

  const fetchManglikStatuses = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/manglik?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchRases = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/ras?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchNakshtras = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/nakshtra?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchGans = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/gan?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchCharans = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/charan?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

    const fetchNadis = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/nadi?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchGotras = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/gotra?search=${search}`);
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
        manglikStatusId: initialData.manglik_status_id?.toString() || "",
        rasId: initialData.ras_id?.toString() || "",
        nakshtraId: initialData.nakshtra_id?.toString() || "",
        ganId: initialData.gan_id?.toString() || "",
        charanId: initialData.charan_id?.toString() || "",
        nadiId: initialData.nadi_id?.toString() || "",
        gotraId: initialData.gotra_id?.toString() || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const payload = {
        memberId: Number(memberId),
        manglikStatusId: formData.manglikStatusId ? Number(formData.manglikStatusId) : null,
        rasId: formData.rasId ? Number(formData.rasId) : null,
        nakshtraId: formData.nakshtraId ? Number(formData.nakshtraId) : null,
        ganId: formData.ganId ? Number(formData.ganId) : null,
        charanId: formData.charanId ? Number(formData.charanId) : null,
        nadiId: formData.nadiId ? Number(formData.nadiId) : null,
        gotraId: formData.gotraId ? Number(formData.gotraId) : null,
      };
      
      const response = await fetch(`${API_URL}/member/member-religion-touch`, {
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
      {/* Modal container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Sticky Title */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Spiritual & Social</h2>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-auto px-6">
          <form onSubmit={handleSubmit} className="space-y-4 py-6">
              <SearchableSelect
                label="Manglik Status"
                value={formData.manglikStatusId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, manglikStatusId: val, manglikStatusName: opt?.name || "" }))}
                fetchOptions={fetchManglikStatuses}
              />

              <SearchableSelect
                label="Ras"
                value={formData.rasId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, rasId: val, rasName: opt?.name || "" }))}
                fetchOptions={fetchRases}
              />

              <SearchableSelect
                label="Nakshatra"
                value={formData.nakshtraId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, nakshtraId: val, nakshtraName: opt?.name || "" }))}
                fetchOptions={fetchNakshtras}
              />
  
              <SearchableSelect
                label="Gan"
                value={formData.ganId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, ganId: val, ganName: opt?.name || "" }))}
                fetchOptions={fetchGans}
              />
  
              <SearchableSelect
                label="Charan"
                value={formData.charanId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, charanId: val, charanName: opt?.name || "" }))}
                fetchOptions={fetchCharans}
              />

              <SearchableSelect
                label="Nadi"
                value={formData.nadiId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, nadiId: val, nadiName: opt?.name || "" }))}
                fetchOptions={fetchNadis}
              />

              <SearchableSelect
                label="Gotra"
                value={formData.gotraId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, gotraId: val, gotraName: opt?.name || "" }))}
                fetchOptions={fetchGotras}
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