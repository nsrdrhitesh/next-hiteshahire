"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from '../../../../../lib/swalHelper';
import { Breadcrumb } from '../../../../../components/ui/breadcrumb';
import Link from "next/link";
import 'react-phone-number-input/style.css'
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import 'react-phone-number-input/style.css';
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

export default function RegistrationStep1() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const router = useRouter();
  const [formData, setFormData] = useState({
    creatingFor: "", mobile: "", email: "", gender: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingForOptions, setCreatingForOptions] = useState<any[]>([]);
  const [genderOptions, setGenderOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [onBehalfRes, genderRes] = await Promise.all([
          fetch(`${API_URL}/member-get/on-behalf`),
          fetch(`${API_URL}/member-get/gender`)
        ]);

        const onBehalfData = await onBehalfRes.json();
        const genderData = await genderRes.json();

        if (onBehalfData.success) {
          setCreatingForOptions(onBehalfData.data.data);
        }

        if (genderData.success) {
          setGenderOptions(genderData.data.data);
        }

      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };

    fetchDropdowns();
  }, []);

  const validateField = (name: string, value: string): boolean => {
    let error = "";
    switch (name) {
      case "creatingFor": if (!value) error = "Please select who this profile is for"; break;
      case "mobile":
        if (!value) {
          error = "Mobile number is required";
        } else if (!isValidPhoneNumber(value)) {
          error = "Please enter a valid mobile number";
        } else {
          // extra rule for India
          if (value.startsWith("+91")) {
            const number = value.replace("+91", "");
          
            if (!/^[6-9]\d{9}$/.test(number)) {
              error = "Indian mobile numbers must start with 6, 7, 8, or 9";
            }
          }
        }
        break;
      case "email": 
        if (!value) error = "Email ID is required";
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) error = "Please enter a valid email address";
        break;
      case "gender": if (!value) error = "Please select gender"; break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const isValid = Object.keys(formData).every(key => validateField(key, formData[key as keyof typeof formData]));
    if (isValid) {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }
      const response = await fetch(`${API_URL}/member/registration-1`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile_for: formData.creatingFor,
          mobile_no: formData.mobile.replace("+91", ""),
          email: formData.email,
          gender: formData.gender
        })
      });
      const result = await response.json();
      console.log("Okay test", result);
      if (result.success) {
        // console.log("Okay Hitesh---- -- ",result.data.id);
        // localStorage.setItem("inquiry_id", result.data.id);
        router.push(`/admin/dashboard/members/create/${result.data.id}/registration/step-2/`);
      } else {
        showError(result.message);
      }
      // showError("Basic information not saved!");
    } else {
      showError("Please fix the errors before proceeding");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const allFieldsFilled =
      formData.creatingFor &&
      formData.mobile &&
      formData.email &&
      formData.gender;
  
    const noErrors = Object.values(errors).every((error) => error === "");
  
    if (allFieldsFilled && noErrors) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData, errors]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <PageHeader
        title="Create New Profile"
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Members", href: "/admin/dashboard/members" },
          { label: "Member Registration" },
          { label: "Step 1" },
        ]}
        step={{ current: 1, total: 10, description: "Basic Information" }}
      />
    
    {/* <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12"> */}
      <div className="mx-auto max-w-2xl px-6">
        <div className="mt-2 flex items-center justify-between px-16">
          <div className="flex gap-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={`h-2.5 w-10 rounded-full ${i === 0 ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"}`} />
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-10">
          <form onSubmit={handleNext} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Creating profile for <span className="text-red-500">*</span></label>
              <select name="creatingFor" value={formData.creatingFor} onChange={handleChange} className={`w-full rounded-2xl border px-5 py-3.5 ${errors.creatingFor ? "border-red-500" : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"}`}>
                <option value="">Select who this profile is for</option>
                {creatingForOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.on_behalf}
                  </option>
                ))}
              </select>
              {errors.creatingFor && <p className="mt-1 text-xs text-red-500">{errors.creatingFor}</p>}
            </div>

            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Mobile Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-gray-500 text-xl font-medium">+91</div>
                <input type="tel" name="mobile" maxLength={10} value={formData.mobile} onChange={handleChange}
                  className={`w-full rounded-2xl border py-3.5 pl-14 pr-5 ${errors.mobile ? "border-red-500" : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"}`} placeholder="9876543210" />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
            </div> */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>

              <PhoneInput
                international
                defaultCountry="IN"
                countryCallingCodeEditable={false}
                value={formData.mobile}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    mobile: value || ""
                  }));
                
                  validateField("mobile", value || "");
                }}
                className={`flex w-full rounded-2xl border px-4 py-3.5 ${
                  errors.mobile
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                }`}
              />

              {errors.mobile && (
                <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email ID <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={`w-full rounded-2xl border px-5 py-3.5 ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"}`} placeholder="youremail@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full rounded-2xl border px-5 py-3.5 ${errors.gender ? "border-red-500" : "border-gray-300 dark:border-gray-700 dark:bg-gray-800"}`}>
                <option value="">Select Gender</option>
                {genderOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.gender}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
            </div>

            <div className="flex gap-4 pt-6">
              <button type="button" onClick={() => window.history.back()} className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" disabled={!isFormValid} className={`flex-1 rounded-2xl py-4 text-base font-semibold ${isFormValid ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600" : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700"}`}>
                Continue to Personal Details →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}