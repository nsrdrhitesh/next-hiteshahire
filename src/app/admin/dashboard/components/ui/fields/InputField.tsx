"use client";
import React from "react";

type Option = {
  label: string;
  value: string;
};

type FormFieldProps = {
  label?: string;
  name: string;
  type?: "text" | "number" | "email" | "password" | "textarea" | "select" | "url" | "date" | "time";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: Option[];
  className?: string;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  options = [],
  className = "",
}) => {
  const baseInputClass =
    "block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400";

  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Field */}
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} ${className}`}
          required={required}
        />
      ) : type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${baseInputClass} ${className}`}
          required={required}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClass} ${className}`}
          // required={required}
        />
      )}

      {/* Error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;