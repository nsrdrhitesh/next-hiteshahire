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

export default function EditLocationModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    permanentCountryId: "",
    permanentCountryName: "",
    permanentStateId: "",
    permanentStateName: "",
    permanentCityId: "",
    permanentCityName: "",
    sameAsPermanent: false,
    readyToRelocate: false,
    presentCountryId: "",
    presentCountryName: "",
    presentStateId: "",
    presentStateName: "",
    presentCityId: "",
    presentCityName: "",
    // nriStatus: "no",
    citizenshipId: "",
    citizenshipName: "",
    // currentResidence: "",
    isAbroad: "no",
    visaStatusId: "",
    visaStatusName: "",
    // visaTypeId: "",
    // visaTypeName: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasStates, setHasStates] = useState(true);
  const [hasCities, setHasCities] = useState(true);
  const [hasPresentStates, setHasPresentStates] = useState(true);
  const [hasPresentCities, setHasPresentCities] = useState(true);

  const fetchCountries = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/countries?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.countryId), name: item.country_name })),
      hasNextPage: false,
    };
  };

  const fetchStates = async (countryId: string, search: string) => {
    if (!countryId) return { data: [], hasNextPage: false };
    const res = await fetch(`${API_URL}/member-get/states/${countryId}?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.stateId), name: item.state_name })),
      hasNextPage: false,
    };
  };

  const fetchCities = async (stateId: string, search: string) => {
    if (!stateId) return { data: [], hasNextPage: false };
    const res = await fetch(`${API_URL}/member-get/cities/${stateId}?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.cityId), name: item.city_name })),
      hasNextPage: false,
    };
  };

  const fetchVisaStatuses = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/visa-status?search=${search}`);
    const json = await res.json();
    const items = json.data?.data || [];
    return {
      data: items.map((item: any) => ({ id: String(item.id), name: item.name })),
      hasNextPage: false,
    };
  };

  const fetchVisaTypes = async (search: string) => {
    const res = await fetch(`${API_URL}/member-get/visa-type?search=${search}`);
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
        permanentCountryId: initialData.permanent_country_id || "",
        permanentCountryName: initialData.permanent_country_name || "",
        permanentStateId: initialData.permanent_state_id || "",
        permanentStateName: initialData.permanent_state_name || "",
        permanentCityId: initialData.permanent_city_id || "",
        permanentCityName: initialData.permanent_city_name || "",
        sameAsPermanent: initialData.is_same_as_permanent === 1,
        readyToRelocate: initialData.is_ready_to_relocate === 1,
        presentCountryId: initialData.present_country_id || "",
        presentCountryName: initialData.present_country_name || "",
        presentStateId: initialData.present_state_id || "",
        presentStateName: initialData.present_state_name || "",
        presentCityId: initialData.present_city_id || "",
        presentCityName: initialData.present_city_name || "",
        // nriStatus: initialData.is_nri === 1 ? "yes" : "no",
        citizenshipId: initialData.citizenship_id || "",
        citizenshipName: initialData.citizenship_name || "",
        // currentResidence: initialData.current_residence || "",
        isAbroad: initialData.is_abroad === 1 ? "yes" : "no",
        visaStatusId: initialData.visa_status_id || "",
        visaStatusName: initialData.visa_status_name || "",
        // visaTypeId: initialData.visa_type_id || "",
        // visaTypeName: initialData.visa_type_name || "",
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
        permanent_country_id: Number(formData.permanentCountryId),
        permanent_state_id: Number(formData.permanentStateId),
        permanent_city_id: Number(formData.permanentCityId),
        present_country_id: formData.sameAsPermanent ? Number(formData.permanentCountryId) : Number(formData.presentCountryId),
        present_state_id: formData.sameAsPermanent ? Number(formData.permanentStateId) : Number(formData.presentStateId),
        present_city_id: formData.sameAsPermanent ? Number(formData.permanentCityId) : Number(formData.presentCityId),
        is_same_as_permanent: formData.sameAsPermanent ? 1 : 0,
        is_ready_to_relocate: formData.readyToRelocate ? 1 : 0,
        citizenship_id: Number(formData.citizenshipId),
        // current_residence: formData.currentResidence,
        // is_nri: formData.nriStatus === "yes" ? 1 : 0,
        is_abroad: formData.isAbroad === "yes" ? 1 : 0,
        visa_status_id: formData.isAbroad === "yes" ? Number(formData.visaStatusId) : null,
        // visa_type_id: formData.isAbroad === "yes" ? Number(formData.visaTypeId) : null,
      };
      
      const response = await fetch(`${API_URL}/member/member-residence`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
      
      showSuccess("Location details updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const showPresentAddress = !formData.sameAsPermanent;
  // const isNRI = formData.nriStatus === "yes";
  const isAbroad = formData.isAbroad === "yes";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Location Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-lg">Permanent Address</h3>
          
          <SearchableSelect
            label="Country"
            value={formData.permanentCountryId}
            onChange={(val, opt) => {
              setFormData(prev => ({
                ...prev,
                permanentCountryId: val,
                permanentCountryName: opt?.name || "",
                permanentStateId: "",
                permanentStateName: "",
                permanentCityId: "",
                permanentCityName: "",
              }));
            }}
            fetchOptions={fetchCountries}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="State"
              value={formData.permanentStateId}
              onChange={(val, opt) => {
                setFormData(prev => ({
                  ...prev,
                  permanentStateId: val,
                  permanentStateName: opt?.name || "",
                  permanentCityId: "",
                  permanentCityName: "",
                }));
                setHasStates(!!val);
              }}
              fetchOptions={(search) => fetchStates(formData.permanentCountryId, search)}
              disabled={!formData.permanentCountryId}
              required
            />
            
            <SearchableSelect
              label="City"
              value={formData.permanentCityId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, permanentCityId: val, permanentCityName: opt?.name || "" }))}
              fetchOptions={(search) => fetchCities(formData.permanentStateId, search)}
              disabled={!formData.permanentStateId}
              required
            />
          </div>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sameAsPermanent}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  sameAsPermanent: checked,
                  presentCountryId: checked ? prev.permanentCountryId : "",
                  presentCountryName: checked ? prev.permanentCountryName : "",
                  presentStateId: checked ? prev.permanentStateId : "",
                  presentStateName: checked ? prev.permanentStateName : "",
                  presentCityId: checked ? prev.permanentCityId : "",
                  presentCityName: checked ? prev.permanentCityName : "",
                }));
              }}
            />
            <span>Present address is same as permanent address</span>
          </label>
          
          {showPresentAddress && (
            <>
              <h3 className="font-semibold text-lg mt-4">Present Address</h3>
              <SearchableSelect
                label="Country"
                value={formData.presentCountryId}
                onChange={(val, opt) => {
                  setFormData(prev => ({
                    ...prev,
                    presentCountryId: val,
                    presentCountryName: opt?.name || "",
                    presentStateId: "",
                    presentStateName: "",
                    presentCityId: "",
                    presentCityName: "",
                  }));
                }}
                fetchOptions={fetchCountries}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect
                  label="State"
                  value={formData.presentStateId}
                  onChange={(val, opt) => {
                    setFormData(prev => ({
                      ...prev,
                      presentStateId: val,
                      presentStateName: opt?.name || "",
                      presentCityId: "",
                      presentCityName: "",
                    }));
                    setHasPresentStates(!!val);
                  }}
                  fetchOptions={(search) => fetchStates(formData.presentCountryId, search)}
                  disabled={!formData.presentCountryId}
                  required
                />
                
                <SearchableSelect
                  label="City"
                  value={formData.presentCityId}
                  onChange={(val, opt) => setFormData(prev => ({ ...prev, presentCityId: val, presentCityName: opt?.name || "" }))}
                  fetchOptions={(search) => fetchCities(formData.presentStateId, search)}
                  disabled={!formData.presentStateId}
                  required
                />
              </div>
            </>
          )}
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.readyToRelocate}
              onChange={(e) => setFormData(prev => ({ ...prev, readyToRelocate: e.target.checked }))}
            />
            <span>Ready to relocate</span>
          </label>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Live abroad?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="isAbroad" value="no" checked={formData.isAbroad === "no"} onChange={(e) => setFormData(prev => ({ ...prev, isAbroad: e.target.value }))} />
                No
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="isAbroad" value="yes" checked={formData.isAbroad === "yes"} onChange={(e) => setFormData(prev => ({ ...prev, isAbroad: e.target.value }))} />
                Yes
              </label>
            </div>
          </div>
          
          {isAbroad && (
            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect
                label="Visa Status"
                value={formData.visaStatusId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, visaStatusId: val, visaStatusName: opt?.name || "" }))}
                fetchOptions={fetchVisaStatuses}
                required
              />
              <SearchableSelect
                label="Citizenship"
                value={formData.citizenshipId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, citizenshipId: val, citizenshipName: opt?.name || "" }))}
                fetchOptions={fetchCountries}
                required
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}