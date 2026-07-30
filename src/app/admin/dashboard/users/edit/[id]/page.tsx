"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from '../../../lib/swalHelper';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import PageHeader from "../../../components/ui/PageHeader";

interface Platform {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

export default function UpdateStaffPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: "",
    confirmPassword: "",
    status: "active",
    joinDate: "",
    bio: "",
    profileImage: "",
    platforms: [] as Platform[],
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [platformSearch, setPlatformSearch] = useState("");

  const departments = [
    { value: "operations", label: "Operations" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "support", label: "Customer Support" },
    { value: "content", label: "Content Creation" },
    { value: "technical", label: "Technical" },
    { value: "hr", label: "Human Resources" },
    { value: "finance", label: "Finance" },
  ];

  const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "on-leave", label: "On Leave" },
    { value: "suspended", label: "Suspended" },
  ];

  // ================= FETCH DATA =================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !staffId) return;

    Promise.all([
      fetch(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/platforms`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/staff/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(async ([r1, r2, r3]) => {
        const rolesData = await r1.json();
        const platformsData = await r2.json();
        const staffData = await r3.json();

        const staff = staffData.data;

        setRoles(rolesData.data.data);
        setPlatforms(platformsData.data.data);

        setFormData({
          firstName: staff.firstName || "",
          lastName: staff.lastName || "",
          email: staff.email || "",
          phone: staff.phone || "",
          role: staff.roles?.[0]?.id?.toString() || "",
          department: staff.department || "",
          password: "",
          confirmPassword: "",
          status: staff.status || "active",
          joinDate: staff.joinDate?.split("T")[0] || "",
          bio: staff.bio || "",
          profileImage: staff.profileImage || "",
          platforms: staff.platforms || [],
        });

        if (staff.profileImage) {
          setImagePreview(staff.profileImage);
        }
      })
      .catch(console.error);
  }, [staffId]);

  // ================= VALIDATION =================
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.role)
      newErrors.role = "Role is required";

    if (!formData.department)
      newErrors.department = "Department is required";

    if (formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= HANDLERS =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePlatform = (platform: Platform) => {
    setFormData((prev) => {
      const exists = prev.platforms.some((p) => p.id === platform.id);
      return {
        ...prev,
        platforms: exists
          ? prev.platforms.filter((p) => p.id !== platform.id)
          : [...prev.platforms, platform],
      };
    });
  };

  const removeSelected = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.filter((p) => p.id !== id),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData((prev) => ({
        ...prev,
        profileImage: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({
      ...prev,
      password,
      confirmPassword: password,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("access_token");

      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        status: formData.status,
        joinDate: formData.joinDate,
        bio: formData.bio,
        profileImage: formData.profileImage,
        roleIds: [Number(formData.role)],
        platformIds: formData.platforms.map((p) => Number(p.id)),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(
        `${API_URL}/staff/${staffId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update staff");
      }
      await showSuccess("Branding record created successfully");
      router.push("/admin/dashboard/users");
    } catch (err: any) {
      setErrors({ submit: err.message });
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlatforms = platforms.filter((p) =>
    p.name.toLowerCase().includes(platformSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <PageHeader
        title="Update Staff Member"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Staff", href: "/admin/dashboard/users" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/users",
            label: "Cancel",
            variant: "secondary",
          },
          {
            label: isLoading ? "Updating..." : "Update Staff",
            type: "submit",
            form: "staff-form",
            variant: "primary",
            disabled: isLoading,
          },
        ]}
      />

      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                      errors.firstName 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="John"
                    // required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                      errors.lastName 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Doe"
                    // required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                      errors.email 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="john.doe@example.com"
                    // required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                Security Information
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                    >
                      Generate Secure Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full rounded-lg border p-3 pr-10 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                        errors.password 
                          ? "border-red-500 dark:border-red-500" 
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Minimum 8 characters with letters, numbers, and special characters
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                      errors.confirmPassword 
                        ? "border-red-500 dark:border-red-500" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>


            {/* Platforms Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800 relative">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Assign Platforms
              </h3>
              <div
                onClick={() => setShowPlatforms(!showPlatforms)}
                className="border border-gray-300 rounded-lg p-3 min-h-[44px] flex flex-wrap gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              >
                {formData.platforms.map((p) => (
                  <span
                    key={p.id}
                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {p.name}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelected(p.id);
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {formData.platforms.length === 0 && (
                  <span className="text-gray-400 text-sm">
                    Select platforms...
                  </span>
                )}
              </div>
              
              {showPlatforms && (
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-h-60 overflow-y-auto">
                  <input
                    placeholder="Search platforms..."
                    value={platformSearch}
                    onChange={(e) => setPlatformSearch(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                  />
                  {filteredPlatforms.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => togglePlatform(p)}
                      className="px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Bio / About
              </h3>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Tell us about this staff member..."
              />
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Profile Image */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Profile Image
            </h3>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, profileImage: "" }));
                    }}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 dark:border-gray-600">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              {errors.profileImage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.profileImage}</p>
              )}
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                {imagePreview ? "Change Image" : "Upload Image"}
              </button>
            </div>
          </div>

          {/* Role & Status */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Role & Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                    errors.role 
                      ? "border-red-500 dark:border-red-500" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department <span className="text-red-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                    errors.department 
                      ? "border-red-500 dark:border-red-500" 
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Join Date
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <div className="flex gap-2">
              <button
                type="submit"
                form="staff-form"
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-600"
              >
                {isLoading ? "Creating..." : "Create Staff Member"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard/users")}
                className="rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
