"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../../components/ui/PageHeader";
import { showSuccess, showError } from "../../../lib/swalHelper";

export default function CreatePlatformMemberField() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [memberFields, setMemberFields] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    platformId: "",
    memberFieldId: "",
    formTypeId: "1",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const token = localStorage.getItem("access_token");
      const [platRes, fieldRes] = await Promise.all([
        fetch(`${API_URL}/platforms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/member-fields`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setPlatforms(await platRes.json());
      setMemberFields(await fieldRes.json());
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/platform-member-fields`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platformId: parseInt(formData.platformId),
          memberFieldId: parseInt(formData.memberFieldId),
          formTypeId: parseInt(formData.formTypeId),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.message && typeof errData.message === "object") {
          setErrors(errData.message);
        } else {
          throw new Error(errData.message || "Creation failed");
        }
        setLoading(false);
        return;
      }

      await showSuccess("Field assigned successfully");
      router.push("/admin/dashboard/platform-member-fields");
      router.refresh();
    } catch (err: any) {
      await showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Field to Platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Platform Fields", href: "/admin/dashboard/platform-member-fields" },
          { label: "Create" },
        ]}
        actionButtons={[
          { href: "/admin/dashboard/platform-member-fields", label: "Cancel", variant: "secondary" },
          { label: loading ? "Saving..." : "Assign Field", type: "submit", form: "assign-form", variant: "primary", disabled: loading },
        ]}
      />

      <form id="assign-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Platform <span className="text-red-400">*</span></label>
            <select name="platformId" value={formData.platformId} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3" required>
              <option value="">Select Platform</option>
              {platforms.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
            {errors.platformId && <p className="mt-1 text-sm text-red-600">{errors.platformId}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Member Field <span className="text-red-400">*</span></label>
            <select name="memberFieldId" value={formData.memberFieldId} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3" required>
              <option value="">Select Field</option>
              {memberFields.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.fieldKey})</option>)}
            </select>
            {errors.memberFieldId && <p className="mt-1 text-sm text-red-600">{errors.memberFieldId}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Form Type <span className="text-red-400">*</span></label>
            <select name="formTypeId" value={formData.formTypeId} onChange={handleChange} className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3">
              <option value="1">Registration Only</option>
              <option value="2">Detail Page Only</option>
              <option value="3">Both</option>
            </select>
            {errors.formTypeId && <p className="mt-1 text-sm text-red-600">{errors.formTypeId}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}