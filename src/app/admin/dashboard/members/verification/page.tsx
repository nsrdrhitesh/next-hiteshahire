// app/member/dashboard/verification/page.tsx
"use client";

import { useState, useEffect } from "react";
import VerificationDocuments from "../[id]/components/VerificationDocuments";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_URL;

export default function VerificationPage() {
  const [memberId, setMemberId] = useState<string>('');
  const [adminActions, setAdminActions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Get current member ID from profile
      const profileRes = await fetch(`${API_URL}/member/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data?.id) {
        setMemberId(profileJson.data.id.toString());
        
        // Get admin actions
        const actionsRes = await fetch(`${API_URL}/member-admin/actions/${profileJson.data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const actionsJson = await actionsRes.json();
        if (actionsJson.success) {
          setAdminActions(actionsJson.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch member data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Verification Center</h1>
      <VerificationDocuments
        memberId={memberId}
        adminActions={adminActions}
        onUpdate={fetchMemberData}
      />
    </div>
  );
}