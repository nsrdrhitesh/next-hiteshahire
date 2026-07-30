"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "../../../../components/ui/PageHeader";
import { showSuccess, showError } from "../../../../lib/swalHelper";

export default function EditPlatformMemberField() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [memberFields, setMemberFields] = useState<any[]>([]);
  const [formData, setFormData] = useState({ platformId: "", memberFieldId: "", formTypeId: "1" });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const [assignRes, platRes, fieldRes] = await Promise.all([
          fetch(`${API_URL}/platform-member-fields/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/platforms`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/member-fields`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const assignment = await assignRes.json();
        setFormData({
          platformId: assignment.platformId.toString(),
          memberFieldId: assignment.memberFieldId.toString(),
          formTypeId: assignment.formTypeId.toString(),
        });
        setPlatforms(await platRes.json());
        setMemberFields(await fieldRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/platform-member-fields/${id}`, {
        method: "PUT",
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
        if (errData.message && typeof errData.message === "object") setErrors(errData.message);
        else throw new Error(errData.message || "Update failed");
        setSubmitting(false);
        return;
      }
      await showSuccess("Assignment updated");
      router.push("/admin/dashboard/platform-member-fields");
      router.refresh();
    } catch (err: any) {
      await showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Platform Field Assignment"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Platform Fields", href: "/admin/dashboard/platform-member-fields" },
          { label: "Edit" },
        ]}
        actionButtons={[
          { href: "/admin/dashboard/platform-member-fields", label: "Cancel", variant: "secondary" },
          { label: submitting ? "Saving..." : "Save Changes", type: "submit", form: "edit-assign-form", variant: "primary", disabled: submitting },
        ]}
      />

      <form id="edit-assign-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Platform</label>
            <select name="platformId" value={formData.platformId} onChange={handleChange} className="w-full rounded-lg border p-3" required>
              {platforms.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Member Field</label>
            <select name="memberFieldId" value={formData.memberFieldId} onChange={handleChange} className="w-full rounded-lg border p-3" required>
              {memberFields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Form Type</label>
            <select name="formTypeId" value={formData.formTypeId} onChange={handleChange} className="w-full rounded-lg border p-3">
              <option value="1">Registration</option>
              <option value="2">Detail</option>
              <option value="3">Both</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}