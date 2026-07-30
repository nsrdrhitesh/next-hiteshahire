"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  MessageSquare, 
  Link as LinkIcon, 
  Hash, 
  Info,
  Plus,
  X,
  AlertCircle
} from "lucide-react";
import { showSuccess, showError } from "../../lib/swalHelper";
import FormField from "../../components/ui/fields/InputField";

interface WhatsAppMessageFormProps {
  mode: "create" | "edit";
  initialData?: any;
  messageId?: string;
}

export default function WhatsAppMessageForm({
  mode,
  initialData,
  messageId,
}: WhatsAppMessageFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variablesList, setVariablesList] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");

  const [formData, setFormData] = useState({
    platformId: parseInt(localStorage.getItem("selected_platform_id") || "0", 10),
    name: "",
    templateUrl: "",
    variables: [] as string[],
    schedulerId: 0,
    conditionId: 0,
    isActive: 1,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        platformId: initialData.platformId,
        name: initialData.name,
        templateUrl: initialData.templateUrl || "",
        variables: initialData.variables || [],
        schedulerId: initialData.schedulerId,
        conditionId: initialData.conditionId,
        isActive: initialData.isActive,
      });
      setVariablesList(initialData.variables || []);
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

  const addVariable = () => {
    if (newVariable.trim() && !variablesList.includes(newVariable.trim())) {
      const updatedVariables = [...variablesList, newVariable.trim()];
      setVariablesList(updatedVariables);
      setFormData(prev => ({ ...prev, variables: updatedVariables }));
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    const updatedVariables = variablesList.filter(v => v !== variable);
    setVariablesList(updatedVariables);
    setFormData(prev => ({ ...prev, variables: updatedVariables }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Message name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.schedulerId || formData.schedulerId <= 0) {
      newErrors.schedulerId = "Please select a scheduler";
    }

    if (!formData.conditionId || formData.conditionId <= 0) {
      newErrors.conditionId = "Please select a condition";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const submissionData = {
        ...formData,
        variables: variablesList.length > 0 ? variablesList : null,
      };

      const url =
        mode === "create"
          ? `${API_URL}/scheduled-campaigns/whatsapp-messages`
          : `${API_URL}/scheduled-campaigns/whatsapp-messages/${messageId}`;
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
        `WhatsApp message ${mode === "create" ? "created" : "updated"} successfully`
      );
      router.push("/admin/dashboard/scheduled-campaigns/whatsapp-messages");
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
                {/* <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Message Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Welcome Message, Payment Confirmation"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )} */}
                <FormField
                  label="Message Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Welcome Message, Payment Confirmation"
                  required
                  error={errors.name}
                />
              </div>

              <div>
                {/* <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Template URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="templateUrl"
                    value={formData.templateUrl}
                    onChange={handleChange}
                    placeholder="https://graph.facebook.com/v18.0/..."
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div> */}
                <FormField
                  label="Template URL"
                  type="url"
                  name="templateUrl"
                  value={formData.templateUrl}
                  onChange={handleChange}
                  placeholder="https://graph.facebook.com/v18.0/..."
                  error={errors.templateUrl}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  WhatsApp Cloud API template URL (optional)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Variables
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={newVariable}
                      onChange={(e) => setNewVariable(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                      placeholder="Enter variable name (e.g., user_name)"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addVariable}
                    className="rounded-lg bg-purple-100 px-3 py-2 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {variablesList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {variablesList.map((variable, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {`{{${variable}}}`}
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="hover:text-purple-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Variables will be replaced with actual values when sending messages
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Scheduling & Conditions
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Scheduler <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="schedulerId"
                  value={formData.schedulerId || ""}
                  onChange={handleChange}
                  placeholder="Enter scheduler ID"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.schedulerId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.schedulerId}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Member Condition <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="conditionId"
                  value={formData.conditionId || ""}
                  onChange={handleChange}
                  placeholder="Enter condition ID"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                {errors.conditionId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.conditionId}</p>
                )}
              </div>

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
                  Inactive messages won't be sent in campaigns
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  WhatsApp Message Guidelines
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Messages must use approved WhatsApp templates</li>
                  <li>• Variables are replaced dynamically from member data</li>
                  <li>• Template URL is required for Cloud API</li>
                  <li>• Test messages before activating campaigns</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Variable Examples
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• <code className="bg-white px-1 rounded">{"{{name}}"}</code> - Member's full name</li>
                  <li>• <code className="bg-white px-1 rounded">{"{{profile_url}}"}</code> - Profile link</li>
                  <li>• <code className="bg-white px-1 rounded">{"{{match_count}}"}</code> - Number of matches</li>
                  <li>• <code className="bg-white px-1 rounded">{"{{days_since_registration}}"}</code> - Days registered</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  Best Practices
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <li>• Use descriptive names for easy identification</li>
                  <li>• Keep variable names simple and consistent</li>
                  <li>• Test with sample data before production</li>
                  <li>• Monitor delivery rates and adjust accordingly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/dashboard/scheduled-campaigns/whatsapp-messages"
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
            ? "Create Message"
            : "Update Message"}
        </button>
      </div>
    </form>
  );
}