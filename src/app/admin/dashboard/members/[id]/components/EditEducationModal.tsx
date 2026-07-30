"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";
import SearchableSelect from "@/app/admin/dashboard/components/ui/SearchableSelect";

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

const fetchOptions = async (endpoint: string, search = "") => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}?search=${encodeURIComponent(search)}`);
    const json = await res.json();
    if (!json.success) return { data: [], hasNextPage: false };
    const items = json.data?.data || [];
    const data = items.map((item: any) => ({ id: String(item.id), name: item.name }));
    return { data, hasNextPage: json.data?.meta?.hasNextPage ?? false };
  } catch (err) {
    return { data: [], hasNextPage: false };
  }
};

export default function EditEducationModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    highestEducationId: "",
    highestEducationName: "",
    otherEducation: "",
    specificationId: "",
    specificationName: "",
    otherSpecification: "",
    employmentTypeId: "",
    employmentTypeName: "",
    occupationId: "",
    occupationName: "",
    businessTypeId: "",
    businessTypeName: "",
    businessLocation: "",
    designation: "",
    companyName: "",
    jobTitle: "",
    workModeId: "",
    workModeName: "",
    workLocation: "",
    annualIncomeId: "",
    annualIncomeName: "",
    totalWealthId: "",
    totalWealthName: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOtherEducation, setShowOtherEducation] = useState(false);
  const [showOtherSpecification, setShowOtherSpecification] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        highestEducationId: initialData.highest_education_id || "",
        highestEducationName: initialData.highest_education_name || "",
        otherEducation: initialData.highest_education_other || "",
        specificationId: initialData.specification_id || "",
        specificationName: initialData.specification_name || "",
        otherSpecification: initialData.specification_other || "",
        employmentTypeId: initialData.employment_type_id || "",
        employmentTypeName: initialData.employment_type_name || "",
        occupationId: initialData.occupation_id || "",
        occupationName: initialData.occupation_name || "",
        businessTypeId: initialData.business_type_id || "",
        businessTypeName: initialData.business_type_name || "",
        businessLocation: initialData.business_location || "",
        designation: initialData.designation || "",
        companyName: initialData.company_name || "",
        jobTitle: initialData.job_title || "",
        workModeId: initialData.work_mode_id || "",
        workModeName: initialData.work_mode_name || "",
        workLocation: initialData.work_location || "",
        annualIncomeId: initialData.annual_income_id || "",
        annualIncomeName: initialData.annual_income_name || "",
        totalWealthId: initialData.total_wealth_id || "",
        totalWealthName: initialData.total_wealth_name || "",
      });
      setShowOtherEducation(!!initialData.highest_education_other);
      setShowOtherSpecification(!!initialData.specification_other);
    }
  }, [initialData]);

  const isSalaried = ["1", "2", "3"].includes(formData.employmentTypeId);
  const isBusiness = formData.employmentTypeId === "5";
  const isStudent = formData.employmentTypeId === "7";
  const isNotWorking = formData.employmentTypeId === "8";
  const showOccupation = !isStudent;
  const showWorkDetails = !isStudent && !isNotWorking;
  const showAnnualIncome = !isStudent && !isNotWorking;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const payload = {
        member_id: Number(memberId),
        highest_education_id: Number(formData.highestEducationId),
        highest_education_other: showOtherEducation ? formData.otherEducation : null,
        specification_id: Number(formData.specificationId),
        specification_other: showOtherSpecification ? formData.otherSpecification : null,
        employment_type_id: Number(formData.employmentTypeId),
        occupation_id: showOccupation ? Number(formData.occupationId) : 0,
        business_type_id: isBusiness ? Number(formData.businessTypeId) : null,
        business_location: isBusiness ? formData.businessLocation : null,
        designation: isSalaried ? formData.designation : null,
        company_name: isSalaried ? formData.companyName : null,
        job_title: isSalaried ? formData.jobTitle : null,
        work_mode_id: showWorkDetails ? Number(formData.workModeId) : 0,
        work_location: showWorkDetails ? formData.workLocation : null,
        annual_income_id: showAnnualIncome ? Number(formData.annualIncomeId) : 0,
        total_wealth_id: Number(formData.totalWealthId) || 0,
      };
      
      const response = await fetch(`${API_URL}/member/member-education-profession`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Failed to save");
      
      showSuccess("Education & profession details updated successfully!");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Education & Career</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            label="Highest Education"
            value={formData.highestEducationId}
            onChange={(val, opt) => {
              setFormData(prev => ({ ...prev, highestEducationId: val, highestEducationName: opt?.name || "" }));
              setShowOtherEducation(opt?.name?.toLowerCase().includes("other") || false);
            }}
            fetchOptions={(search) => fetchGroupedOptions("member-get/education", search)}
            required
          />
          
          {showOtherEducation && (
            <div>
              <label className="block text-sm font-semibold mb-2">Other Education *</label>
              <input
                name="otherEducation"
                value={formData.otherEducation}
                onChange={(e) => setFormData(prev => ({ ...prev, otherEducation: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>
          )}
          
          <SearchableSelect
            label="Specialization"
            value={formData.specificationId}
            onChange={(val, opt) => {
              setFormData(prev => ({ ...prev, specificationId: val, specificationName: opt?.name || "" }));
              setShowOtherSpecification(opt?.name?.toLowerCase().includes("other") || false);
            }}
            fetchOptions={(search) => fetchGroupedOptions("member-get/specialization", search)}
            required
          />
          
          {showOtherSpecification && (
            <div>
              <label className="block text-sm font-semibold mb-2">Other Specialization *</label>
              <input
                name="otherSpecification"
                value={formData.otherSpecification}
                onChange={(e) => setFormData(prev => ({ ...prev, otherSpecification: e.target.value }))}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>
          )}
          
          <SearchableSelect
            label="Employment Type"
            value={formData.employmentTypeId}
            onChange={(val, opt) => {
              setFormData(prev => ({
                ...prev,
                employmentTypeId: val,
                employmentTypeName: opt?.name || "",
                occupationId: "",
                occupationName: "",
                businessTypeId: "",
                businessTypeName: "",
                businessLocation: "",
                designation: "",
                companyName: "",
                jobTitle: "",
                workModeId: "",
                workModeName: "",
                workLocation: "",
                annualIncomeId: "",
                annualIncomeName: "",
              }));
            }}
            fetchOptions={(search) => fetchOptions("member-get/employment-type", search)}
            required
          />
          
          {showOccupation && (
            <SearchableSelect
              label="Occupation"
              value={formData.occupationId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, occupationId: val, occupationName: opt?.name || "" }))}
              fetchOptions={(search) => fetchGroupedOptions("member-get/occupation", search)}
              required={showOccupation}
            />
          )}
          
          {isSalaried && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="designation"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="Designation *"
                className="rounded-xl border px-4 py-2"
                required
              />
              <input
                name="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Company Name *"
                className="rounded-xl border px-4 py-2"
                required
              />
              <input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Job Title *"
                className="rounded-xl border px-4 py-2 col-span-2"
                required
              />
            </div>
          )}
          
          {isBusiness && (
            <>
              <SearchableSelect
                label="Business Type"
                value={formData.businessTypeId}
                onChange={(val, opt) => setFormData(prev => ({ ...prev, businessTypeId: val, businessTypeName: opt?.name || "" }))}
                fetchOptions={(search) => fetchOptions("member-get/business-type", search)}
                required
              />
              <input
                name="businessLocation"
                value={formData.businessLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, businessLocation: e.target.value }))}
                placeholder="Business Location *"
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </>
          )}
          
          {showWorkDetails && (
            <SearchableSelect
              label="Work Mode"
              value={formData.workModeId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, workModeId: val, workModeName: opt?.name || "" }))}
              fetchOptions={(search) => fetchOptions("member-get/work-mode", search)}
              required={showWorkDetails}
            />
          )}
          
          {showWorkDetails && (
            <input
              name="workLocation"
              value={formData.workLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, workLocation: e.target.value }))}
              placeholder="Work Location"
              className="w-full rounded-xl border px-4 py-2"
            />
          )}
          
          {showAnnualIncome && (
            <SearchableSelect
              label="Annual Income"
              value={formData.annualIncomeId}
              onChange={(val, opt) => setFormData(prev => ({ ...prev, annualIncomeId: val, annualIncomeName: opt?.name || "" }))}
              fetchOptions={(search) => fetchOptions("member-get/annual-income", search)}
              required={showAnnualIncome}
            />
          )}
          
          <SearchableSelect
            label="Wealth"
            value={formData.totalWealthId}
            onChange={(val, opt) => setFormData(prev => ({ ...prev, totalWealthId: val, totalWealthName: opt?.name || "" }))}
            fetchOptions={(search) => fetchOptions("member-get/wealth-range", search)}
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