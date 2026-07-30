import Link from 'next/link';
import { Fragment } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string; // if omitted, the item is the current page (non-clickable)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-2 text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <li>/</li>}
            <li>
              {item.href ? (
                <Link href={item.href} className="hover:text-purple-600">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}