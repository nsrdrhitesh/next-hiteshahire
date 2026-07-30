"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Clock,
  RefreshCw,
  FileText,
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  MessageCircle,
  Heart,
  Eye as EyeIcon,
  Phone,
  Video,
  Award
} from "lucide-react";

/* ================= UTIL ================= */

const formatAmount = (val: any) => {
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString();
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

/* ================= HELPERS ================= */

const getFeatureIcon = (name: string) => {
  const n = name?.toLowerCase() || "";
  if (n.includes("profile")) return <EyeIcon className="h-5 w-5" />;
  if (n.includes("interest")) return <Heart className="h-5 w-5" />;
  if (n.includes("chat")) return <MessageCircle className="h-5 w-5" />;
  if (n.includes("video")) return <Video className="h-5 w-5" />;
  if (n.includes("contact")) return <Phone className="h-5 w-5" />;
  return <Zap className="h-5 w-5" />;
};

const getStatusColor = (p: number) => {
  if (p >= 80) return "bg-red-500";
  if (p >= 60) return "bg-orange-500";
  if (p >= 40) return "bg-yellow-500";
  return "bg-green-500";
};

/* ================= COMPONENT ================= */

export default function PlanFeatures({ memberId }: { memberId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoices, setShowInvoices] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/member-plan-details/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      setData(json?.data || null);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: number, number: string) => {
    setDownloading(id);
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/invoice-download/${id}/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${number}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleView = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/invoice/${id}/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      setSelectedInvoice(json?.data || null);
      setShowModal(true);
    } catch {
      alert("Failed to load invoice");
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="animate-spin text-purple-600" />
      </div>
    );
  }

  if (!data?.currentPlan) {
    return (
    //   <div className="text-center py-10 text-gray-500 dark:text-gray-400">
    //     <Award className="mx-auto mb-3" />
    //     No Active Plan
    //   </div>
        <div></div>
    );
  }

  const { currentPlan, features = [], invoices = [] } = data;

return (
  <div className="space-y-6">

    {/* ===== FEATURES ===== */}
    <div className="bg-[#1f2937] rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700 text-white font-medium">
        Plan Features
      </div>

      <div className="p-4 space-y-4">
        {features.map((f: any, i: number) => (
          <div key={i}>
            <div className="flex justify-between text-sm">
              <div className="flex gap-2 text-gray-300">
                {getFeatureIcon(f.name)}
                {f.name}
              </div>
              <div className="text-gray-400">
                {f.used}/{f.total}
              </div>
            </div>

            {f.total !== "Unlimited" && (
              <div className="h-2 bg-gray-700 mt-2 rounded">
                <div
                  style={{ width: `${Number(f.usagePercentage || 0)}%` }}
                  className="bg-purple-500 h-2 rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ===== INVOICES ===== */}
    <div className="bg-[#1f2937] rounded-lg border border-gray-700">
      <button
        onClick={() => setShowInvoices(!showInvoices)}
        className="w-full flex justify-between items-center p-4 text-white"
      >
        <span>Invoice History ({invoices.length})</span>
        {showInvoices ? <ChevronUp /> : <ChevronDown />}
      </button>

      {showInvoices && (
        <div className="border-t border-gray-700">
          {invoices.map((inv: any) => (
            <div
              key={inv.id}
              className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-800"
            >
              <div className="text-gray-300">{inv.invoiceNumber}</div>
              <div className="text-gray-400">{formatDate(inv.date)}</div>
              <div className="text-purple-400">
                ₹{formatAmount(inv.amount)}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleView(inv.id)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() =>
                    handleDownload(inv.id, inv.invoiceNumber)
                  }
                  className="text-green-400 hover:text-green-300"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ===== MODAL (MATCH YOUR SCREENSHOT STYLE) ===== */}
    {showModal && selectedInvoice && (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
        <div className="bg-[#1f2937] border border-gray-700 rounded-lg w-[500px] p-6 text-white">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invoice Details</h3>
            <X
              className="cursor-pointer text-gray-400"
              onClick={() => setShowModal(false)}
            />
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">Invoice Number</p>
              <p>{selectedInvoice.invoiceNumber}</p>
            </div>

            <div>
              <p className="text-gray-400">Plan</p>
              <p>{selectedInvoice.planName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Date</p>
                <p>{formatDateTime(selectedInvoice.date)}</p>
              </div>

              <div>
                <p className="text-gray-400">Status</p>
                <p>{selectedInvoice.status || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-400">Amount</p>
              <p className="text-purple-400 font-semibold">
                ₹{formatAmount(selectedInvoice.amount)}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              handleDownload(
                selectedInvoice.id,
                selectedInvoice.invoiceNumber
              )
            }
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded"
          >
            Download PDF
          </button>
        </div>
      </div>
    )}
  </div>
);
}