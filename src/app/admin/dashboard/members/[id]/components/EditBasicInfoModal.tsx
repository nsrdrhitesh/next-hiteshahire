"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

export default function EditBasicInfoModal({ isOpen, onClose, memberId, initialData, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    mobile_no: "",
    email: "",
    introduction: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [creatingForOptions, setCreatingForOptions] = useState<any[]>([]);
  const [genderOptions, setGenderOptions] = useState<any[]>([]);
  const [profileFor, setProfileFor] = useState("");

  // Fetch dropdown options
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [onBehalfRes, genderRes] = await Promise.all([
          fetch(`${API_URL}/member-get/on-behalf`),
          fetch(`${API_URL}/member-get/gender`)
        ]);
        const onBehalfData = await onBehalfRes.json();
        const genderData = await genderRes.json();
        if (onBehalfData.success) setCreatingForOptions(onBehalfData.data.data);
        if (genderData.success) setGenderOptions(genderData.data.data);
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (initialData) {
      // console.log("Okay tesyt data Here by Hiteshg",initialData);
      setFormData({
        first_name: initialData.first_name || "",
        middle_name: initialData.middle_name || "",
        last_name: initialData.last_name || "",
        date_of_birth: initialData.date_of_birth || "",
        gender: initialData.gender || "",
        mobile_no: initialData.mobile_no || "",
        email: initialData.email || "",
        introduction: initialData.introduction || "",
        password: "",
      });
      setProfileFor(initialData.profile_for || "");
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      // First update registration-1 (profile_for)
      const payload1 = {
        id: Number(memberId),
        profile_for: profileFor,
      };

      console.log("Payload for registration-1 update:", payload1);
      
      // const res1 = await fetch(`${API_URL}/member/update-registration-basic`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify(payload1),
      // });
      console.log("Response from registration-1 update:",profileFor, initialData.profile_for);
      const res1 = await fetch(`${API_URL}/member/update-registration-basic`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          member_id: Number(memberId),
          profile_for: Number(profileFor),
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          gender: Number(formData.gender),
          mobile_no: formData.mobile_no,
          email: formData.email,
          introduction: formData.introduction,
          password: formData.password || undefined,
        }),
      });
      
      if (!res1.ok) throw new Error("Failed to update profile info");
      
      // Update registration-2 (personal details)
      // const payload2 = {
      //   table_inquiry_id: Number(memberId),
      //   first_name: formData.first_name,
      //   middle_name: formData.middle_name,
      //   last_name: formData.last_name,
      //   date_of_birth: formData.date_of_birth,
      //   gender: formData.gender,
      //   mobile_no: formData.mobile_no,
      //   email: formData.email,
      //   ...(formData.password && { password: formData.password }),
      // };
      
      // const res2 = await fetch(`${API_URL}/member/update-personal-details`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      //   body: JSON.stringify(payload2),
      // });
      
      // const json2 = await res2.json();
      // if (!res2.ok || !json2.success) throw new Error(json2.message || "Failed to update personal details");
      
      showSuccess("Basic info updated successfully!");
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Basic Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Creating profile for *</label>
            <select
              value={profileFor}
              onChange={(e) => setProfileFor(e.target.value)}
              className="w-full rounded-xl border px-4 py-2"
              required
            >
              <option value="">Select who this profile is for</option>
              {creatingForOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.on_behalf}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">First Name *</label>
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Middle Name</label>
              <input
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Last Name *</label>
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full rounded-xl border px-4 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-2"
              required
            >
              <option value="">Select Gender</option>
              {genderOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.gender}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mobile Number *</label>
            <input
              type="tel"
              name="mobile_no"
              value={formData.mobile_no}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email ID *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Introduction</label>
            <textarea
              name="introduction"
              value={formData.introduction}
              onChange={handleChange}
              className="w-full rounded-xl border px-4 py-2"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password (leave blank to keep unchanged)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="w-full rounded-xl border px-4 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-xl">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}