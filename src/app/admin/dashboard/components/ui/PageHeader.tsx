'use client';

import Link from 'next/link';
import { Plus, X } from 'lucide-react';
import { Breadcrumb } from './breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Permission {
  resource: string;
  action: string;
}

interface ActionButton {
  href?: string;
  label: string;
  permission?: {
    resource: string;
    action: string;
  };
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface CreateButtonConfig {
  href: string;
  label?: string;
  permission?: {
    resource: string;
    action: string;
  };
  icon?: React.ReactNode;
}

interface StepConfig {
  current: number;
  total: number;
  description: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbItems: BreadcrumbItem[];
  step?: StepConfig; // <-- New optional step prop
  permissions?: Permission[];
  createButton?: CreateButtonConfig;
  actionButtons?: ActionButton[];
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbItems,
  step, // <-- step prop
  permissions = [],
  createButton,
  actionButtons = [],
  className = '',
}: PageHeaderProps) {
  
  const hasPermission = (resource?: string, action?: string): boolean => {
    if (!resource || !action) return true;
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  // Filter action buttons based on permissions
  const visibleActionButtons = actionButtons.filter(button => 
    hasPermission(button.permission?.resource, button.permission?.action)
  );

  // Check Create Button visibility
  const showCreateButton = createButton && 
    hasPermission(createButton.permission?.resource, createButton.permission?.action);

  return (
    <div className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-center ${className}`}>
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {title}
        </h1>

        {/* Step Description */}
        {step && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Step <span className="font-semibold text-purple-600">{step.current} of {step.total}</span> — {step.description}
          </p>
        )}

        {/* Standard Description (optional) */}
        {description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons Area */}
      <div className="flex gap-3">
        {/* Create Button (for list pages) */}
        {showCreateButton && (
          <Link
            href={createButton.href}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-pink-600 hover:shadow-md"
          >
            {createButton.icon || <Plus className="h-5 w-5" />}
            {createButton.label || 'Create New'}
          </Link>
        )}

        {/* Custom Action Buttons (Cancel, Submit, Edit, etc.) */}
        {visibleActionButtons.length > 0 && (
          <>
            {visibleActionButtons.map((button, index) => {
              const isPrimary = button.variant === 'primary';
              const isDanger = button.variant === 'danger';

              const baseClasses = `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all`;

              const variantClasses = isPrimary
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 hover:shadow-md'
                : isDanger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';

              const commonProps = {
                className: `${baseClasses} ${variantClasses}`,
                disabled: button.disabled,
              };

              // If it's a submit button (for forms)
              if (button.type === 'submit') {
                return (
                  <button
                    key={index}
                    type="submit"
                    form={button.form}
                    {...commonProps}
                  >
                    {button.icon}
                    {button.label}
                  </button>
                );
              }

              // If it's a regular button with onClick
              if (button.onClick) {
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={button.onClick}
                    {...commonProps}
                  >
                    {button.icon}
                    {button.label}
                  </button>
                );
              }

              // Default: Link (for Cancel, Back, etc.)
              if (button.href) {
                return (
                  <Link
                    key={index}
                    href={button.href}
                    className={commonProps.className}
                  >
                    {button.icon || (button.label.toLowerCase().includes('cancel') ? <X className="h-4 w-4" /> : null)}
                    {button.label}
                  </Link>
                );
              }

              return null;
            })}
          </>
        )}
      </div>
    </div>
  );
}