"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Breadcrumb } from '../../../../components/ui/breadcrumb';
import { showSuccess, showError } from '../../../../lib/swalHelper';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface FormData {
  platform_id: number | "";
  site_name: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
  ternary_color?: string;
  fourth_color?: string;
  fifth_color?: string;
  primary_font_family?: string;
  secondary_font_family?: string;
  ternary_font_family?: string;
  footer_text?: string;
}

export default function EditDomainBranding() {
  const router = useRouter();
  const { id } = useParams();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState<FormData>({
    platform_id: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    site_name: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedPlatformId = localStorage.getItem("selected_platform_id");

  const MAX_LOGO_SIZE = 2 * 1024 * 1024;     // 2 MB
  const MAX_FAVICON_SIZE = 1 * 1024 * 1024;  // 1 MB

  // Fetch existing data
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/domain/branding/${selectedPlatformId}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load branding");

        const data = await res.json();

        console.log("Fetched branding data:", data.data);

        setFormData({
          platform_id: data.data.platform_id,
          site_name: data.data.site_name,
          logo: data.data.logo,
          favicon: data.data.favicon,
          primary_color: data.data.primary_color,
          secondary_color: data.data.secondary_color,
          ternary_color: data.data.ternary_color,
          fourth_color: data.data.fourth_color,
          fifth_color: data.data.fifth_color,
          primary_font_family: data.data.primary_font_family,
          secondary_font_family: data.data.secondary_font_family,
          ternary_font_family: data.data.ternary_font_family,
          footer_text: data.data.footer_text,
        });

        setLogoPreview(data.data.logo || null);
        setFaviconPreview(data.data.favicon || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBranding();
  }, [id, router, API_URL]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field when user types
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleColorChange = (field: keyof FormData, color: string) => {
    setFormData((prev) => ({ ...prev, [field]: color }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = field === "logo" ? MAX_LOGO_SIZE : MAX_FAVICON_SIZE;
    const fieldLabel = field === "logo" ? "Logo" : "Favicon";

    // Clear previous error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    // ── Validation ───────────────────────────────
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${fieldLabel} file size must be under ${maxSize / 1024 / 1024}MB`,
      }));
      return;
    }

    if (!file.type.startsWith("image/") && field === "logo") {
      setErrors((prev) => ({
        ...prev,
        [field]: "Only image files are allowed (PNG, JPG, WebP, etc.)",
      }));
      return;
    }

    if (field === "favicon" && !["image/png", "image/x-icon", "image/vnd.microsoft.icon"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Favicon should be PNG or ICO format",
      }));
      return;
    }

    // ── Read & preview ───────────────────────────
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;

      if (field === "logo") {
        setLogoPreview(dataUrl);
        setFormData((prev) => ({ ...prev, logo: dataUrl }));
      } else {
        setFaviconPreview(dataUrl);
        setFormData((prev) => ({ ...prev, favicon: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove handlers
  const removeLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: undefined }));
    setErrors((prev) => { const n = { ...prev }; delete n.logo; return n; });
  };

  const removeFavicon = () => {
    setFaviconPreview(null);
    setFormData((prev) => ({ ...prev, favicon: undefined }));
    setErrors((prev) => { const n = { ...prev }; delete n.favicon; return n; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return router.push("/login");

      const res = await fetch(`${API_URL}/domain/branding/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        
        // Handle field validation errors from backend
        if (errData.message && typeof errData.message === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(', ');
            } else if (typeof msgs === 'string') {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          // General error message
          setError(errData.message || 'Create failed');
        }
        setLoading(false);
        return;
      }
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/domain-manage/branding");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      // showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading branding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Domain Branding"
        // description="Update branding settings for this platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "Branding", href: "/admin/dashboard/domain-manage/branding" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/branding",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: submitting ? "Saving..." : "Save Changes",
            type: "submit",
            form: "branding-form",
            variant: "primary",
            disabled: submitting,
          },
        ]}
      />

      {/* {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
        </div>
      )} */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form id="branding-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Site Name */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Site Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleTextChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                // required
              />
              {errors.site_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.site_name}</p>
              )}
            </div>

            {/* Logo */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Logo
              </h3>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-40 w-full rounded-lg object-contain border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 shadow-sm"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-10 dark:border-gray-600">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, SVG — max 2 MB — recommended ~200×60 px
                    </p>
                  </div>
                )}

                {errors.logo && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
                )}

                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "logo")}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </button>
              </div>
            </div>
              
            {/* Favicon ── (very similar) */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Favicon
              </h3>
              <div className="space-y-4">
                {faviconPreview ? (
                  <div className="relative mx-auto w-28">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeFavicon}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 shadow-md"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-10 dark:border-gray-600">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17l3.94-3.94a2 2 0 012.828 0L17 17m-4-4l1.94-1.94a2 2 0 012.828 0L21 15m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG or ICO — 32×32 or 64×64 px — max 1 MB
                    </p>
                  </div>
                )}

                {errors.favicon && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.favicon}</p>
                )}

                <input
                  type="file"
                  id="favicon-upload"
                  accept="image/png,image/x-icon,.ico"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "favicon")}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("favicon-upload")?.click()}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {faviconPreview ? "Change Favicon" : "Upload Favicon"}
                </button>
              </div>
            </div>

            {/* Colors – same as create */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Colors</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { key: "primary_color", label: "Primary Color" },
                  { key: "secondary_color", label: "Secondary Color" },
                  { key: "ternary_color", label: "Ternary Color" },
                  { key: "fourth_color", label: "Fourth Color" },
                  { key: "fifth_color", label: "Fifth Color" },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-3">
                    <label className="block text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {label}
                    </label>
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <HexColorPicker
                          color={(formData as any)[key] || "#000000"}
                          onChange={(color) => handleColorChange(key as keyof FormData, color)}
                          className="!w-full max-w-[220px] mx-auto"
                        />
                      </div>
                      {/* Hex input – directly below the picker */}
                      <div className="flex max-w-[220px] mx-auto overflow-hidden rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                        <HexColorInput
                          color={(formData as any)[key] || ""}
                          onChange={(color) => handleColorChange(key as keyof FormData, color)}
                          className="flex-1 bg-transparent px-3 py-2.5 text-sm font-mono focus:outline-none
                                     dark:text-white"
                          prefixed
                        />
                        {/* <div
                          className="h-10 w-10 shrink-0 border-l border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: (formData as any)[key] || "#000000" }}
                        /> */}
                        {/* <div
                          className="h-10 w-10 shrink-0 rounded-md border border-gray-300 shadow-sm overflow-hidden"
                          style={{ backgroundColor: (formData as any)[key] || "#000000" }}
                        /> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts & Footer – same as before */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Fonts</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {["primary_font_family", "secondary_font_family", "ternary_font_family"].map((field) => (
                  <div key={field}>
                    <label className="mb-1 block text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {field.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={(formData as any)[field] || ""}
                      onChange={handleTextChange}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g. 'Inter', sans-serif"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                Footer Text
              </label>
              <textarea
                name="footer_text"
                value={formData.footer_text || ""}
                onChange={handleTextChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Custom footer message..."
              />
            </div>
          </form>
        </div>

        {/* Sidebar – similar to create */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Update Branding</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Changes will be applied immediately after saving.
            </p>
            <div className="mt-6">
              <button
                type="submit"
                form="branding-form"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}