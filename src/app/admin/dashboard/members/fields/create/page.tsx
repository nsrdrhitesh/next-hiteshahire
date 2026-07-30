"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../../components/ui/PageHeader";
import { showSuccess, showError } from "../../../lib/swalHelper";

export default function CreateMemberField() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    fieldKey: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`${API_URL}/member-fields`, {
        method: "POST",
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
          throw new Error(errData.message || "Creation failed");
        }
        setLoading(false);
        return;
      }

      await showSuccess("Member field created successfully");
      router.push("/admin/dashboard/members/fields");
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
        title="Create Member Field"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Member Fields", href: "/admin/dashboard/members/fields" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/members/fields",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: loading ? "Saving..." : "Create Field",
            type: "submit",
            form: "field-form",
            variant: "primary",
            disabled: loading,
          },
        ]}
      />

      <form id="field-form" onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="e.g., Full Name, Date of Birth"
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
              placeholder="e.g., full_name, date_of_birth"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Unique identifier used in backend (snake_case recommended)</p>
            {errors.fieldKey && <p className="mt-1 text-sm text-red-600">{errors.fieldKey}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}