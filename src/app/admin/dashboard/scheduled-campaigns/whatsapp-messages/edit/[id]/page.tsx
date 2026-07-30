
// Edit Page - D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\domain-manage\whatsapp-messages\edit\[id]\page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "../../../../components/ui/breadcrumb";
import WhatsAppMessageForm from "../../../components/WhatsAppMessageForm";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";

interface WhatsAppMessage {
  id: number;
  platformId: number;
  name: string;
  templateUrl: string | null;
  variables: string[] | null;
  schedulerId: number;
  conditionId: number;
  isActive: number;
}

export default function EditWhatsAppMessage() {
  const { id } = useParams();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL || "";
  const [message, setMessage] = useState<WhatsAppMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const selectedPlatformId = localStorage.getItem("selected_platform_id");
        const res = await fetch(
          `${API_URL}/scheduled-campaigns/whatsapp-messages/${selectedPlatformId}/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load message");

        const result = await res.json();
        setMessage(result.data);
      } catch (err: any) {
        setError(err.message || "Could not load data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessage();
  }, [id, router, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading message data...</p>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error || "Message not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit WhatsApp Message"
        // description={`Update scheduling rules for ${scheduler.name}`}
        breadcrumbItems={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Scheduled Campaigns", href: "/admin/dashboard/scheduled-campaigns" },
          { label: "WhatsApp Messages", href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages" },
          { label: "Edit" },
        ]}
        actionButtons={[
          {
            href: "/admin/dashboard/scheduled-campaigns/whatsapp-messages",
            label: "Back to List",
            icon: <ArrowLeft className="h-4 w-4" />,
          },
        ]}
      />
      <WhatsAppMessageForm mode="edit" initialData={message} messageId={id as string} />
    </div>
  );
}
