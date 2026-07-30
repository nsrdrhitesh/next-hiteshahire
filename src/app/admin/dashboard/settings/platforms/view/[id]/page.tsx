"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import { ArrowLeft, Edit } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "http://localhost:3003/api/v1";

interface Permission {
  id: number;
  name: string;
  resource: string;
  action: string;
}

interface NamedItem {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
  code: string;
  description: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  religion_ids?: number[];
  caste_ids?: number[];
  country_ids?: number[];
  state_ids?: number[];
  mother_tongue_ids?: number[];
}

export default function ViewPlatformPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // Store fetched relation names
  const [religions, setReligions] = useState<NamedItem[]>([]);
  const [castes, setCastes] = useState<NamedItem[]>([]);
  const [countries, setCountries] = useState<NamedItem[]>([]);
  const [states, setStates] = useState<NamedItem[]>([]);
  const [motherTongues, setMotherTongues] = useState<NamedItem[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem("permissions");
    if (stored) setPermissions(JSON.parse(stored));
  }, []);

  // Fetch all relation data
  const fetchRelationData = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;
      
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      const [religionsRes, motherTonguesRes, countriesRes] = await Promise.all([
        fetch(`${API_URL}/member-get/religion`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/member-get/language`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/member-get/countries`, { headers }).then(r => r.json()),
      ]);
      
      if (religionsRes.success && religionsRes.data?.data) {
        setReligions(religionsRes.data.data.map((item: any) => ({
          id: item.id,
          name: item.name
        })));
      }
      
      if (motherTonguesRes.success && motherTonguesRes.data?.data) {
        setMotherTongues(motherTonguesRes.data.data.map((item: any) => ({
          id: item.id,
          name: item.name
        })));
      }
      
      if (countriesRes.success && countriesRes.data?.data) {
        setCountries(countriesRes.data.data.map((item: any) => ({
          id: item.countryId,
          name: item.country_name
        })));
      }
      
      // Fetch castes and states if needed based on platform data
      if (platform?.caste_ids && platform.caste_ids.length > 0) {
        // Fetch all castes or fetch individually as needed
        const castesRes = await fetch(`${API_URL}/member-get/castes/all`, { headers });
        const castesJson = await castesRes.json();
        if (castesJson.success && castesJson.data?.data) {
          setCastes(castesJson.data.data.map((item: any) => ({
            id: item.id,
            name: item.name
          })));
        }
      }
      
      if (platform?.state_ids && platform.state_ids.length > 0) {
        // Fetch states for each country or fetch all states
        const allStates: NamedItem[] = [];
        for (const countryId of (platform.country_ids || [])) {
          const statesRes = await fetch(`${API_URL}/member-get/states/${countryId}`, { headers });
          const statesJson = await statesRes.json();
          if (statesJson.success && statesJson.data?.data) {
            statesJson.data.data.forEach((item: any) => {
              allStates.push({
                id: item.stateId || item.id,
                name: item.state_name || item.name
              });
            });
          }
        }
        setStates(allStates);
      }
      
    } catch (err) {
      console.error("Failed to fetch relation data:", err);
    }
  };

  const fetchPlatform = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/platforms/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch platform");
      }

      const result = await response.json();
      setPlatform(result.data);
      
      // After getting platform data, fetch relation names
      await fetchRelationData();
    } catch (err) {
      setError("Failed to load platform details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPlatform();
  }, [id]);

  // Helper to get names from IDs
  const getNamesFromIds = (ids: number[] | undefined, items: NamedItem[]): string => {
    if (!ids || ids.length === 0) return "None";
    return items
      .filter(item => ids.includes(item.id))
      .map(item => item.name)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading platform details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Details"
        breadcrumbItems={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Settings', href: '/admin/dashboard/settings' },
          { label: 'Platforms', href: '/admin/dashboard/settings/platforms' },
          { label: 'Details' },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/settings/platforms",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
          {
            href: `/admin/dashboard/settings/platforms/edit/${id}`,
            label: "Edit Platform",
            icon: <Edit className="h-4 w-4" />,
            variant: 'primary',
            permission: { 
              resource: "platforms", 
              action: "edit"
            }
          }
        ]}
        permissions={permissions}
      />

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Platform Name
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {platform?.name}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Platform Code
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              {platform?.code}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                platform?.is_active === 1
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {platform?.is_active === 1 ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created Date
            </p>
            <p className="mt-1 text-gray-900 dark:text-white">
              {platform?.created_at
                ? new Date(platform.created_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Associated Data Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Associated Data
          </h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Religions
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {getNamesFromIds(platform?.religion_ids, religions)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Castes
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {getNamesFromIds(platform?.caste_ids, castes)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mother Tongues
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {getNamesFromIds(platform?.mother_tongue_ids, motherTongues)}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Countries
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {getNamesFromIds(platform?.country_ids, countries)}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                States
              </p>
              <p className="mt-1 text-gray-900 dark:text-white">
                {getNamesFromIds(platform?.state_ids, states)}
              </p>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200 dark:border-gray-700"></div>

        {/* Description */}
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Description
          </p>
          <div className="mt-3 rounded-xl bg-gray-50 p-4 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {platform?.description || "No description provided."}
          </div>
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Platform ID</h4>
          <p className="mt-2 text-xl font-bold">{platform?.id}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Last Updated</h4>
          <p className="mt-2 text-sm">
            {platform?.updated_at
              ? new Date(platform.updated_at).toLocaleString()
              : "-"}
          </p>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-md">
          <h4 className="text-sm font-medium opacity-80">Current Status</h4>
          <p className="mt-2 text-lg font-semibold">
            {platform?.is_active === 1 ? "Operational" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
}