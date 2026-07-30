"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "../../../../components/ui/PageHeader";
import { showSuccess, showError } from "../../../../lib/swalHelper";

export default function EditMemberField() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ name: "", fieldKey: "" });

  useEffect(() => {
    const fetchField = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return router.push("/login");

        const res = await fetch(`${API_URL}/member-fields/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load field");
        const data = await res.json();
        setFormData({ name: data.name, fieldKey: data.fieldKey });
      } catch (err: any) {
        await showError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchField();
  }, [id, router, API_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/member-fields/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.message && typeof errData.message === "object") {
          setErrors(errData.message);
        } else {
          throw new Error(errData.message || "Update failed");
        }
        setSubmitting(false);
        return;
      }

      await showSuccess("Member field updated successfully");
      router.push("/admin/dashboard/member-fields");
      router.refresh();
    } catch (err: any) {
      await showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Member Field"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Member Fields", href: "/admin/dashboard/member-fields" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/member-fields",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: submitting ? "Saving..." : "Save Changes",
            type: "submit",
            form: "edit-field-form",
            variant: "primary",
            disabled: submitting,
          },
        ]}
      />

      <form id="edit-field-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Display Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Field Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="fieldKey"
              value={formData.fieldKey}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            {errors.fieldKey && <p className="mt-1 text-sm text-red-600">{errors.fieldKey}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}