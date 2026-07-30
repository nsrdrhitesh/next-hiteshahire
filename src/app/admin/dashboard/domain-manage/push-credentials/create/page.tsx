// D:\Next-Nest\Matrimony\frontend-repo\src\app\admin\dashboard\scheduled-campaigns\push\credentials\create\page.tsx
"use client";

import { Breadcrumb } from "../../../components/ui/breadcrumb";
import PushCredentialForm from "../../components/PushCredentialForm";

export default function CreatePushCredential() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Domain Management", href: "/admin/dashboard/domain-manage" },
            { label: "Push Credentials", href: "/admin/dashboard/domain-manage/push-credentials" },
            { label: "Create" },
          ]}
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Push Credential
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add new Firebase Cloud Messaging credentials for push notifications
        </p>
      </div>

      <PushCredentialForm mode="create" />
    </div>
  );
}