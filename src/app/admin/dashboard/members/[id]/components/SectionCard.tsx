"use client";

import { Pencil } from "lucide-react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  className?: string;
}

export default function SectionCard({ title, children, onEdit, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all hover:shadow-md ${className}`}>
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50/30 to-pink-50/30 dark:from-gray-800/50 dark:to-gray-800/50">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-5 bg-purple-500 rounded-full"></span>
          {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}