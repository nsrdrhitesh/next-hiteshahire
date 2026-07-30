"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from '../../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../../components/ui/breadcrumb';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

export default function RegistrationStep2() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({ firstName: "", middleName: "", lastName: "", dateOfBirth: "", password: "", confirmPassword: "", table_inquiry_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()).toISOString().split("T")[0];
  const minDate = new Date(today.getFullYear() - 100, 0, 1).toISOString().split("T")[0];

  const formatName = (value: string) => value.replace(/[^a-zA-Z\s]/g, "").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  const validateField = (name: keyof typeof formData, value: string): boolean => {
    let error = "";
    if (name === "firstName" || name === "middleName" || name === "lastName") {
      if (!value.trim()) error = "This field is required";
      else if (value.trim().length < 2) error = "Minimum 2 characters required";
    }
    // if (name === "middleName" && value.trim() && value.trim().length < 2) error = "Minimum 2 characters if filled";
    if (name === "dateOfBirth") {
      if (!value) error = "Date of Birth is required";
      else if (value > maxDate) error = "You must be at least 18 years old";
    }
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 6) error = "Password must be at least 6 characters";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = "Must contain 1 uppercase, 1 lowercase & 1 number";
    }
    if (name === "confirmPassword") {
      if (!value) error = "Please confirm password";
      else if (value !== formData.password) error = "Passwords do not match";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatted = formatName(value);
    setFormData(prev => ({ ...prev, [name]: formatted }));
    validateField(name as keyof typeof formData, formatted);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof typeof formData, value);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const isValid = Object.keys(formData).every(k =>
      validateField(k as keyof typeof formData, formData[k as keyof typeof formData])
    );
  
    if (!isValid) {
      showError("Please fix all errors before proceeding");
      return;
    }
  
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/login");
      return;
    }
  
    const { confirmPassword, ...payload } = formData; // remove confirmPassword
  
    const response = await fetch(`${API_URL}/member/registration-2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showSuccess("Personal details saved successfully!");
      // router.push(`/admin/dashboard/members/create/religion-form/${result.member_id}`);
      router.push(`/admin/dashboard/members/create/${result.data.member_id}/religion-form`);
    } else {
      showError(result.message);
    }
  };

  useEffect(() => {
    const valid = formData.firstName.trim().length >= 2 && formData.lastName.trim().length >= 2 &&
      (formData.middleName === "" || formData.middleName.trim().length >= 2) &&
      formData.dateOfBirth !== "" && formData.dateOfBirth <= maxDate &&
      formData.password.length >= 6 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) &&
      formData.confirmPassword === formData.password;
    setIsFormValid(valid);
  }, [formData, maxDate]);

  useEffect(() => {
    if (params?.id) {
      setFormData(prev => ({
        ...prev,
        table_inquiry_id: params.id as string
      }));
    }
  }, [params]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <PageHeader
        title="Personal Information"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Member Registration" },
          { label: "Step 2" },
        ]}
        step={{ current: 2, total: 10, description: "Personal Information" }}
      />

      <div className="mx-auto max-w-2xl px-6">
        <div className="mt-2 flex items-center justify-between px-16">
          <div className="flex gap-2">
            {Array.from({ length: 10 }, (_, i) => <div key={i} className={`h-2.5 w-10 rounded-full ${i < 2 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"}`} />)}
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-10">
          <form onSubmit={handleNext} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name <span className="text-red-500">*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleNameChange} maxLength={50}
                  className={`w-full rounded-2xl border px-5 py-3.5 ${errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Rahul" />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Middle Name <span className="text-red-500">*</span></label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleNameChange} maxLength={50}
                  className={`w-full rounded-2xl border px-5 py-3.5 ${errors.middleName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Kumar (optional)" />
                {errors.middleName && <p className="mt-1 text-xs text-red-500">{errors.middleName}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name <span className="text-red-500">*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleNameChange} maxLength={50}
                  className={`w-full rounded-2xl border px-5 py-3.5 ${errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Sharma" />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} min={minDate} max={maxDate}
                className={`w-full rounded-2xl border px-5 py-3.5 ${errors.dateOfBirth ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} />
              {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  className={`w-full rounded-2xl border px-5 py-3.5 pr-12 ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Create strong password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className={`w-full rounded-2xl border px-5 py-3.5 pr-12 ${errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-700"}`} placeholder="Re-enter password" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex gap-4 pt-6">
              {/* <button type="button" onClick={() => window.history.back()} className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">← Back to Step 1</button> */}
              <button type="submit" disabled={!isFormValid} className={`flex-1 rounded-2xl py-4 text-base font-semibold ${isFormValid ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600" : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700"}`}>
                Continue to Religion →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}