// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\scheduled-campaigns\whatsapp\credentials\edit\[id]\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import WhatsAppCredentialForm from "../../../components/WhatsAppCredentialForm";

interface WhatsAppCredential {
  id: number;
  platformId: number;
  credentialName: string;
  phoneNumber: string;
  phoneNumberId: string;
  whatsappBusinessAccountId: string;
  accessToken: string;
  templateNamespace: string | null;
  twoFactorSecret: string | null;
  isActive: number;
}

export default function EditWhatsAppCredential() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [credential, setCredential] = useState<WhatsAppCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredential = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/platforms/whatsapp-credentials/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load credential");

        const result = await res.json();
        setCredential(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCredential();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading credential data...</p>
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Credential not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
            { label: "WhatsApp Credentials", href: "/admin/dashboard/domain-manage/whatsapp-credentials" },
            { label: "Edit" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit WhatsApp Credential
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update WhatsApp Business API credentials
        </p>
      </div>

      <WhatsAppCredentialForm mode="edit" initialData={credential} credentialId={id as string} />
    </div>
  );
}