"use client";

import { Fragment } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title = "Delete Record",
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
