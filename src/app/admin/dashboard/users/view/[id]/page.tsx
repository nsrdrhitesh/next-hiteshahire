"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from '../../../components/ui/breadcrumb';

interface Platform {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

interface Staff {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  status: string;
  joinDate: string;
  bio: string;
  profileImage: string;
  roles: Role[];
  platforms: Platform[];
}

export default function ViewStaffPage() {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;
  const params = useParams();
  const router = useRouter();
  const staffId = params?.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !staffId) return;

    fetch(`${API_URL}/staff/${staffId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setStaff(data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [staffId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Staff not found</p>
      </div>
    );
  }

  const statusColors: any = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    "on-leave": "bg-yellow-100 text-yellow-700",
    suspended: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', href: '/admin/dashboard' },
              { label: 'Staff', href: '/admin/dashboard/users' },
              { label: 'Details' },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Details
          </h1>
          {/* <p className="mt-1 text-gray-500 dark:text-gray-400">
            View complete staff profile information
          </p> */}
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/users"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
          >
            Back
          </Link>

          <button
            onClick={() =>
              router.push(`/admin/dashboard/users/edit/${staffId}`)
            }
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white"
          >
            Edit Staff
          </button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
            {staff.profileImage ? (
              <img
                src={staff.profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-white text-purple-600 text-4xl font-bold">
                {staff.firstName.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold">
              {staff.firstName} {staff.lastName}
            </h2>
            <p className="opacity-90 mt-1">
              {staff.roles?.[0]?.name || "No Role Assigned"}
            </p>
            <span
              className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[staff.status]}`}
            >
              {staff.status}
            </span>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <Info label="First Name" value={staff.firstName} />
              <Info label="Last Name" value={staff.lastName} />
              <Info label="Email" value={staff.email} />
              <Info label="Phone" value={staff.phone || "-"} />
              <Info label="Department" value={staff.department} />
              <Info label="Join Date" value={staff.joinDate?.split("T")[0] || "-"} />
            </div>
          </div>

          {/* Bio */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              About
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {staff.bio || "No bio available"}
            </p>
          </div>

        </div>

        {/* Right Section */}
        <div className="space-y-6">

          {/* Role */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Role
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {staff.roles?.map(r => r.name).join(", ") || "No role assigned"}
            </p>
          </div>

          {/* Platforms */}
          <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Assigned Platforms
            </h3>

            {staff.platforms?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {staff.platforms.map(p => (
                  <span
                    key={p.id}
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No platforms assigned
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* Reusable Info Component */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium text-gray-900 dark:text-white mt-1">
        {value || "-"}
      </p>
    </div>
  );
}
