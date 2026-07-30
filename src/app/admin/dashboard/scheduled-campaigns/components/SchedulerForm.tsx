"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Info } from "lucide-react";
import { showSuccess, showError } from "../../lib/swalHelper";
import FormField from "../../components/ui/fields/InputField";

interface SchedulerFormProps {
  mode: "create" | "edit";
  initialData?: any;
  schedulerId?: string;
}

type ScheduleType = "datetime" | "daily" | "date" | "range" | "afterRegistration" | "afterApproval";

export default function SchedulerForm({
  mode,
  initialData,
  schedulerId,
}: SchedulerFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scheduleType, setScheduleType] = useState<ScheduleType>("daily");

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    name: "",
    scheduleTime: "",
    scheduleDate: "",
    scheduleFromDate: "",
    scheduleToDate: "",
    afterRegistrationMin: "",
    afterApprovalMin: "",
    isActive: 1,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        platformId: initialData.platformId,
        name: initialData.name,
        scheduleTime: initialData.scheduleTime || "",
        scheduleDate: initialData.scheduleDate || "",
        scheduleFromDate: initialData.scheduleFromDate || "",
        scheduleToDate: initialData.scheduleToDate || "",
        afterRegistrationMin: initialData.afterRegistrationMin || "",
        afterApprovalMin: initialData.afterApprovalMin || "",
        isActive: initialData.isActive,
      });

      // Determine schedule type from existing data
      if (initialData.scheduleTime && initialData.scheduleDate) {
        setScheduleType("datetime");
      } else if (initialData.scheduleTime) {
        setScheduleType("daily");
      } else if (initialData.scheduleDate) {
        setScheduleType("date");
      } else if (initialData.scheduleFromDate && initialData.scheduleToDate) {
        setScheduleType("range");
      } else if (initialData.afterRegistrationMin) {
        setScheduleType("afterRegistration");
      } else if (initialData.afterApprovalMin) {
        setScheduleType("afterApproval");
      }
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleScheduleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    // Reset scheduling fields based on type
    setFormData((prev) => ({
      ...prev,
      scheduleTime: "",
      scheduleDate: "",
      scheduleFromDate: "",
      scheduleToDate: "",
      afterRegistrationMin: "",
      afterApprovalMin: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Scheduler name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    switch (scheduleType) {
      case "datetime":
        if (!formData.scheduleTime) newErrors.scheduleTime = "Time is required";
        if (!formData.scheduleDate) newErrors.scheduleDate = "Date is required";
        break;
      case "daily":
        if (!formData.scheduleTime) newErrors.scheduleTime = "Time is required";
        break;
      case "date":
        if (!formData.scheduleDate) newErrors.scheduleDate = "Date is required";
        break;
      case "range":
        if (!formData.scheduleFromDate) newErrors.scheduleFromDate = "Start date is required";
        if (!formData.scheduleToDate) newErrors.scheduleToDate = "End date is required";
        break;
      case "afterRegistration":
        if (!formData.afterRegistrationMin) newErrors.afterRegistrationMin = "Minutes are required";
        else if (parseInt(formData.afterRegistrationMin) <= 0) newErrors.afterRegistrationMin = "Minutes must be greater than 0";
        break;
      case "afterApproval":
        if (!formData.afterApprovalMin) newErrors.afterApprovalMin = "Minutes are required";
        else if (parseInt(formData.afterApprovalMin) <= 0) newErrors.afterApprovalMin = "Minutes must be greater than 0";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareSubmissionData = () => {
    const data: any = {
      platformId: formData.platformId,
      name: formData.name,
      isActive: formData.isActive,
    };

    switch (scheduleType) {
      case "datetime":
        data.scheduleTime = formData.scheduleTime;
        data.scheduleDate = formData.scheduleDate;
        break;
      case "daily":
        data.scheduleTime = formData.scheduleTime;
        break;
      case "date":
        data.scheduleDate = formData.scheduleDate;
        break;
      case "range":
        data.scheduleFromDate = formData.scheduleFromDate;
        data.scheduleToDate = formData.scheduleToDate;
        break;
      case "afterRegistration":
        data.afterRegistrationMin = formData.afterRegistrationMin;
        break;
      case "afterApproval":
        data.afterApprovalMin = formData.afterApprovalMin;
        break;
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const submissionData = prepareSubmissionData();
      const url =
        mode === "create"
          ? `${API_URL}/scheduled-campaigns/schedulers`
          : `${API_URL}/scheduled-campaigns/schedulers/${schedulerId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));

        if (errData.message && typeof errData.message === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(errData.message).forEach(([field, msgs]) => {
            if (Array.isArray(msgs)) {
              fieldErrors[field] = msgs.join(", ");
            } else if (typeof msgs === "string") {
              fieldErrors[field] = msgs;
            }
          });
          setErrors(fieldErrors);
        } else {
          showError(errData.message || `${mode === "create" ? "Create" : "Update"} failed`);
        }
        setLoading(false);
        return;
      }

      await showSuccess(
        `Scheduler ${mode === "create" ? "created" : "updated"} successfully`
      );
      router.push("/admin/dashboard/scheduled-campaigns/schedulers");
      router.refresh();
    } catch (err: any) {
      console.error("Error submitting form:", err);
      showError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div>
                <FormField
                  label="Scheduler Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Welcome Email, Daily Digest"
                  required
                  error={errors.name}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Schedule Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => handleScheduleTypeChange(e.target.value as ScheduleType)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">Daily at specific time</option>
                  <option value="datetime">Specific date and time</option>
                  <option value="date">Specific date</option>
                  <option value="range">Date range</option>
                  <option value="afterRegistration">After registration</option>
                  <option value="afterApproval">After approval</option>
                </select>
              </div>

              {/* Dynamic fields based on schedule type */}
              {(scheduleType === "daily" || scheduleType === "datetime") && (
                <div>
                  <FormField
                    label="Time"
                    type="time"
                    name="scheduleTime"
                    value={formData.scheduleTime}
                    onChange={handleChange}
                    placeholder="e.g., 14:30"
                    // min={new Date().toISOString().split('T')[0]}
                    required
                    error={errors.scheduleTime}
                  />
                </div>
              )}

              {(scheduleType === "datetime" || scheduleType === "date") && (
                <div>
                  <FormField
                    label="Date"
                    type="date"
                    name="scheduleDate"
                    value={formData.scheduleDate}
                    onChange={handleChange}
                    placeholder="e.g., 2024-12-31"
                    // min={new Date().toISOString().split('T')[0]}
                    required
                    error={errors.scheduleDate}
                  />
                </div>
              )}

              {scheduleType === "range" && (
                <>
                  <div>
                    <FormField
                      label="From Date"
                      type="date"
                      name="scheduleFromDate"
                      value={formData.scheduleFromDate}
                      onChange={handleChange}
                      required
                      error={errors.scheduleFromDate}
                    />
                  </div>
                  <div>
                    <FormField
                      label="To Date"
                      type="date"
                      name="scheduleToDate"
                      value={formData.scheduleToDate}
                      onChange={handleChange}
                      required
                      error={errors.scheduleToDate}
                    />
                  </div>
                </>
              )}

              {(scheduleType === "afterRegistration" || scheduleType === "afterApproval") && (
                <div>
                  <FormField
                    label={`Minutes After ${scheduleType === "afterRegistration" ? "Registration" : "Approval"}`}
                    type="number"
                    name={scheduleType === "afterRegistration" ? "afterRegistrationMin" : "afterApprovalMin"}
                    value={scheduleType === "afterRegistration" ? formData.afterRegistrationMin : formData.afterApprovalMin}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    required
                    error={errors[scheduleType === "afterRegistration" ? "afterRegistrationMin" : "afterApprovalMin"]}
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive === 1}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked ? 1 : 0 }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Active
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Inactive schedulers won't trigger any campaigns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Schedule Type Information
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• <strong>Daily:</strong> Runs at specific time every day</li>
                  <li>• <strong>Specific Date & Time:</strong> One-time execution</li>
                  <li>• <strong>Specific Date:</strong> Runs on the selected date at default time</li>
                  <li>• <strong>Date Range:</strong> Runs daily between dates</li>
                  <li>• <strong>After Registration:</strong> X minutes after user registers</li>
                  <li>• <strong>After Approval:</strong> X minutes after profile approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Important Notes
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Schedulers work with WhatsApp and Push campaigns</li>
                  <li>• Date-based schedulers use platform timezone</li>
                  <li>• After-event schedulers require user event tracking</li>
                  <li>• Test schedulers before enabling in production</li>
                </ul>
              </div>
            </div>
          </div> */}

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Example Use Cases
            </h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <p><strong>Welcome Campaign:</strong> After registration (30 min)</p>
              <p><strong>Daily Digest:</strong> Daily at 9:00 AM</p>
              <p><strong>Festival Offer:</strong> Date range (Oct 25-31)</p>
              <p><strong>Birthday Wishes:</strong> Specific date</p>
              <p><strong>Approval Confirmation:</strong> After approval (15 min)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/dashboard/scheduled-campaigns/schedulers"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-600 disabled:opacity-70"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Scheduler"
            : "Update Scheduler"}
        </button>
      </div>
    </form>
  );
}