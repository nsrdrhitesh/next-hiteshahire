"use client";

import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/app/admin/dashboard/lib/swalHelper";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData: any;
  onSuccess: () => void;
}

interface FormData {
  album_privacy: string;
  profile_visibility: string;
  profile_picture_visibility: string;
  contact_number_visibility: string;
  which_contact_number_visibility: string;
  video_call_setting: string;
  show_in_search_results: string;
  show_online_status: string;
}

// Option mappings for each setting
const albumPrivacyOptions = [
  { value: "1", label: "Visible to All" },
  { value: "2", label: "Only to Paid Matches" },
  { value: "3", label: "Only to Interest Sent/Accepted" },
];

const profileVisibilityOptions = [
  { value: "1", label: "Show to All" },
  { value: "2", label: "Hide From All" },
  { value: "3", label: "Only to Matches That Fit My Criteria" },
];

const profilePictureVisibilityOptions = [
  { value: "1", label: "Visible to All" },
  { value: "2", label: "Hide From All" },
  { value: "3", label: "Only to Matches That Fit My Criteria" },
];

const contactNumberVisibilityOptions = [
  { value: "1", label: "Visible to All" },
  { value: "2", label: "Hide From All" },
  { value: "3", label: "Only to Interest Sent/Accepted" },
];

const whichContactNumberOptions = [
  { value: "1", label: "Only My Contact Form" },
  { value: "2", label: "Only My Parent Contact Form" },
  { value: "3", label: "Show Both" },
];

const videoCallOptions = [
  { value: "1", label: "Only from Accepted Interest" },
  { value: "2", label: "Allow All Matches" },
  { value: "3", label: "Don't Allow Video Calls" },
];

const yesNoOptions = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

export default function EditPrivacySettingsModal({
  isOpen,
  onClose,
  memberId,
  initialData,
  onSuccess,
}: PrivacySettingsModalProps) {
  const [formData, setFormData] = useState<FormData>({
    album_privacy: "1",
    profile_visibility: "1",
    profile_picture_visibility: "1",
    contact_number_visibility: "1",
    which_contact_number_visibility: "1",
    video_call_setting: "1",
    show_in_search_results: "1",
    show_online_status: "1",
  });
  const [loading, setLoading] = useState(false);

  // Load initial data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        album_privacy: initialData.album_privacy?.toString() || "1",
        profile_visibility: initialData.profile_visibility?.toString() || "1",
        profile_picture_visibility: initialData.profile_picture_visibility?.toString() || "1",
        contact_number_visibility: initialData.contact_number_visibility?.toString() || "1",
        which_contact_number_visibility: initialData.which_contact_number_visibility?.toString() || "1",
        video_call_setting: initialData.video_call_setting?.toString() || "1",
        show_in_search_results: initialData.show_in_search_results?.toString() || "1",
        show_online_status: initialData.show_online_status?.toString() || "1",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      showError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // Prepare payload with numeric values
      const payload = {
        memberId: Number(memberId),
        album_privacy: Number(formData.album_privacy),
        profile_visibility: Number(formData.profile_visibility),
        profile_picture_visibility: Number(formData.profile_picture_visibility),
        contact_number_visibility: Number(formData.contact_number_visibility),
        which_contact_number_visibility: Number(formData.which_contact_number_visibility),
        video_call_setting: Number(formData.video_call_setting),
        show_in_search_results: Number(formData.show_in_search_results),
        show_online_status: Number(formData.show_online_status),
      };

      const response = await fetch(`${API_URL}/member/update-privacy-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update privacy settings");
      }

      showSuccess("Privacy settings updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      showError(err.message || "An error occurred while saving privacy settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Sticky Title */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Privacy Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Control who can see your profile information and how you interact with others
          </p>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-auto px-6">
          <form onSubmit={handleSubmit} className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Album Privacy */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Album Privacy
                </label>
                <select
                  name="album_privacy"
                  value={formData.album_privacy}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {albumPrivacyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Control who can view your photo albums</p>
              </div>

              {/* Profile Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Profile Visibility
                </label>
                <select
                  name="profile_visibility"
                  value={formData.profile_visibility}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {profileVisibilityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Determine who can see your full profile</p>
              </div>

              {/* Profile Picture Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Profile Picture Visibility
                </label>
                <select
                  name="profile_picture_visibility"
                  value={formData.profile_picture_visibility}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {profilePictureVisibilityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Manage who can see your profile photo</p>
              </div>

              {/* Contact Number Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Contact Number Visibility
                </label>
                <select
                  name="contact_number_visibility"
                  value={formData.contact_number_visibility}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {contactNumberVisibilityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Control who can see your contact number</p>
              </div>

              {/* Which Contact Number to Display */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Which Contact Number to Display
                </label>
                <select
                  name="which_contact_number_visibility"
                  value={formData.which_contact_number_visibility}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {whichContactNumberOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Choose which contact number to show when visible</p>
              </div>

              {/* Video Call Setting */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Video Call Setting
                </label>
                <select
                  name="video_call_setting"
                  value={formData.video_call_setting}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {videoCallOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Set preferences for video call requests</p>
              </div>

              {/* Show in Search Results */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Show in Search Results
                </label>
                <select
                  name="show_in_search_results"
                  value={formData.show_in_search_results}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {yesNoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Allow your profile to appear in search results</p>
              </div>

              {/* Show Online Status */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Show Online Status
                </label>
                <select
                  name="show_online_status"
                  value={formData.show_online_status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {yesNoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Display your online/offline status to others</p>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Buttons at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}