"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HexColorPicker, HexColorInput } from "react-colorful"; // ← NEW
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '../../../lib/swalHelper';
import PageHeader from "../../../components/ui/PageHeader";

interface FormData {
  platform_id: number | "";
  site_name: string;
  logo?: string;          // Will store URL or preview
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

export default function CreateDomainBranding() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";

  const [formData, setFormData] = useState<FormData>({
    platform_id: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    site_name: "",
    primary_color: "#6366f1", // default indigo-500
    secondary_color: "#ec4899", // pink-500
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Optional: max sizes in bytes
  const MAX_LOGO_SIZE = 2 * 1024 * 1024;    // 2MB
  const MAX_FAVICON_SIZE = 1 * 1024 * 1024; // 1MB

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
    const fieldName = field === "logo" ? "Logo" : "Favicon";

    // Reset previous error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    // Size check
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${fieldName} size should be less than ${maxSize / 1024 / 1024}MB`,
      }));
      return;
    }

    // Type check
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        [field]: `Please upload a valid image file for ${fieldName}`,
      }));
      return;
    }

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

  // Remove functions
  const removeLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo: undefined }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.logo;
      return next;
    });
  };

  const removeFavicon = () => {
    setFaviconPreview(null);
    setFormData((prev) => ({ ...prev, favicon: undefined }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.favicon;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation example
    // if (!formData.platform_id || !formData.site_name) {
    //   setError("Platform ID and Site Name are required");
    //   setLoading(false);
    //   return;
    // }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // In real app: upload logo/favicon files first, get URLs, then send them
      // Here we just send previews (demo)

      const payload = {
        ...formData,
        // logo: realLogoUrl,    // replace with uploaded URL
        // favicon: realFaviconUrl,
      };

      const res = await fetch(`${API_URL}/domain/branding`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
          setError(errData.message || 'Create failed');
        }
        setLoading(false);
        return;
      }
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/domain-manage/branding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Create Domain Branding"
        // description="Define custom branding for a specific platform"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
          { label: "Branding", href: "/admin/dashboard/domain-manage/branding" },
          { label: "Create" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/domain-manage/branding",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: loading ? "Creating..." : "Create Branding",
            type: "submit",
            form: "branding-form",
            variant: "primary",
            disabled: loading,
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
                placeholder="e.g. Jain Matrimony"
                // required
              />
              {errors.site_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.site_name}</p>
              )}
            </div>

            {/* Logo Upload */}
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
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
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
                      PNG, JPG, SVG up to 2MB — recommended 200×60 px
                    </p>
                  </div>
                )}

                {errors.logo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
                )}

                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "logo")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </button>
              </div>
            </div>
              
            {/* Favicon (very similar) ── */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Favicon
              </h3>
              <div className="space-y-4">
                {faviconPreview ? (
                  <div className="relative mx-auto w-24">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="h-20 w-20 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeFavicon}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 shadow-md"
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
                      ICO, PNG 32×32 or 64×64 px recommended — max 1MB
                    </p>
                  </div>
                )}

                {errors.favicon && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.favicon}</p>
                )}

                <input
                  type="file"
                  id="favicon-upload"
                  accept="image/*,.ico"
                  onChange={(e) => handleImageChange(e, "favicon")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("favicon-upload")?.click()}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {faviconPreview ? "Change Favicon" : "Upload Favicon"}
                </button>
              </div>
            </div>

            {/* Colors */}
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
                
                    {/* Color Picker + Input – stacked vertically */}
                    <div className="space-y-3">
                      {/* The picker itself */}
                      <div className="flex justify-center">
                        <HexColorPicker
                          color={(formData as any)[key] || "#000000"}
                          onChange={(color) => handleColorChange(key as keyof FormData, color)}
                          className="!w-full max-w-[220px] mx-auto" // slightly larger picker, centered
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Branding Settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Colors use HEX format (#rrggbb). Logo & favicon will be uploaded to your storage (S3/Cloudinary recommended).
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                form="branding-form"
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600"
              >
                Create Branding
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Preview Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Primary color should have good contrast with text</li>
              <li>• Favicon should be square & simple</li>
              <li>• Test on mobile & desktop</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}