"use client";

import { useState, useEffect } from "react";
import { 
  Ban, 
  Trash2, 
  CheckCircle, 
  XCircle,
  FileCheck,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  RotateCcw,
  Download,
  ShieldCheck,
  FileText,
  Gift,
  Calendar,
  Tag,
  History,
  ChevronDown,
  ChevronUp,
  CreditCard,
  IndianRupee,
  XOctagon
} from "lucide-react";
import { showSuccess, showError } from '../../../lib/swalHelper';

const MEDIA_URL = process.env.NEXT_PUBLIC_BACKEND_DATA_PLAIN || '';

const getFullImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${MEDIA_URL}/${cleanPath}`;
};

type PlanFeature = {
  id: number;
  name: string;
  description: string;
  units: string;
};

type Duration = {
  id: number;
  duration_days: number;
  display_name: string;
  description: string;
};

type Offer = {
  id: number;
  name: string;
  description: string;
  discount_type: number;
  discount_value: number;
  applicable_duration_ids: number[];
  applicable_device_codes: number[] | null;
  start_date: string;
  end_date: string;
  conflict_handle_discount: number;
};

type MemberPlan = {
  id: number;
  platform_id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  features: PlanFeature[];
  durations: Duration[];
  offers: Offer[];
  best_offer?: Offer;
};

type PaymentRecord = {
  id: number;
  memberId: number;
  planId: number;
  durationId: number;
  offerId: number | null;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  status: string;
  notes: string;
  createdAt: string;
};

interface MemberActionsProps {
  memberId: string;
  memberName: string;
  memberData: any;
  adminActions: any;
  onActionComplete: () => void;
}

export default function MemberActions({ 
  memberId, 
  memberName, 
  memberData,
  adminActions,
  onActionComplete 
}: MemberActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<any>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{url: string, type: string, name: string} | null>(null);
  const [reasonText, setReasonText] = useState("");

  // Plan selection states
  const [memberPlans, setMemberPlans] = useState<MemberPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MemberPlan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);

  // Payment history states
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Add near other state declarations
  const [showCancelPlanConfirm, setShowCancelPlanConfirm] = useState(false);

  const isBlocked = adminActions?.is_blocked === 1;
  const isDeleted = adminActions?.is_deleted === 1;
  const casteStatus = adminActions?.caste_verification_status || 'not_submitted';
  const documentStatus = adminActions?.document_verification_status || 'not_submitted';
  const hasCasteDocument = adminActions?.caste_verification_document_path;
  const hasDocument = adminActions?.document_verification_document_path;
  const isCasteFlagSent = adminActions?.caste_verification_flag_sent_at;
  const isDocumentFlagSent = adminActions?.document_verification_flag_sent_at;

  const isPlanActive = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    setIsFetchingHistory(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/history/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await response.json();
      if (result.success && result.data) {
        setPaymentHistory(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment history", error);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  // Fetch payment history when component mounts or history is toggled
  useEffect(() => {
    if (showPaymentHistory && paymentHistory.length === 0) {
      fetchPaymentHistory();
    }
  }, [showPaymentHistory]);

  const togglePaymentHistory = () => {
    setShowPaymentHistory(!showPaymentHistory);
    if (!showPaymentHistory && paymentHistory.length === 0) {
      fetchPaymentHistory();
    }
  };
  
  const getTimeElapsed = (dateString: string | null) => {
    if (!dateString) return null;
    const sentDate = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return `${Math.floor(diffHours * 60)} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cancel Plan function
  const handleCancelPlan = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-admin/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          member_id: parseInt(memberId),
          action: 'cancel_plan',
        }),
      });

      const result = await response.json();
      if (result.success) {
        await showSuccess('Plan cancelled successfully!');
        onActionComplete();
        setShowCancelPlanConfirm(false);
        fetchPaymentHistory();
      } else {
        showError(result.message || "Failed to cancel plan");
      }
    } catch (error) {
      showError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if plan can be cancelled (has active plan and not deleted)
  const canCancelPlan = () => {
    return adminActions?.current_plan_id && 
           !isDeleted && 
           isPlanActive(adminActions?.plan_end_date);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'created': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPaymentSource = (notes: string) => {
    try {
      const parsed = JSON.parse(notes);
      if (parsed.assigned_by === 'admin') {
        return { source: 'Admin', color: 'text-blue-600', icon: ShieldCheck };
      }
      return { source: 'User', color: 'text-green-600', icon: UserCheck };
    } catch {
      return { source: 'Unknown', color: 'text-gray-600', icon: CreditCard };
    }
  };

  const casteFlagTime = getTimeElapsed(adminActions?.caste_verification_flag_sent_at);
  const documentFlagTime = getTimeElapsed(adminActions?.document_verification_flag_sent_at);

  // ... rest of the existing functions (handleAction, fetchMemberPlans, openPlanModal, etc.) remain the same ...

  const handleAction = async (action: string, data?: any) => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-admin/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          member_id: parseInt(memberId),
          action,
          ...data,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        await showSuccess(`${action.replace(/_/g, ' ')} completed successfully!`);
        onActionComplete();
        setShowModal(false);
        setShowDocumentPreview(false);
        setReasonText("");
        setSelectedPlan(null);
        setSelectedDuration(null);
        setSelectedOffer(null);
        // Refresh payment history after plan assignment
        fetchPaymentHistory();
      } else {
        showError(result.message || "Action failed");
      }
    } catch (error) {
      showError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPlans = async () => {
    setIsFetchingPlans(true);
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-get/plans/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setMemberPlans(result.data);
      } else {
        showError("No plans available for this member");
      }
    } catch (error) {
      console.error("Failed to fetch member plans", error);
      showError("Failed to load plans");
    } finally {
      setIsFetchingPlans(false);
    }
  };

  const openPlanModal = () => {
    setSelectedPlan(null);
    setSelectedDuration(null);
    setSelectedOffer(null);
    fetchMemberPlans();
    setShowDocumentPreview(false);
    setReasonText("");
    setModalConfig({
      type: 'assign_plan',
      title: 'Assign Plan to Member',
      needReason: false,
      isPlanModal: true,
    });
    setShowModal(true);
  };

  const calculatePlanPrice = () => {
    if (!selectedPlan || !selectedDuration) return { basePrice: 0, discountAmount: 0, finalPrice: 0 };
    const months = Math.ceil(selectedDuration.duration_days / 30);
    const basePrice = selectedPlan.monthly_price * months;
    if (!selectedOffer) return { basePrice, discountAmount: 0, finalPrice: basePrice };
    let discountAmount = 0;
    if (selectedOffer.discount_type === 1) {
      discountAmount = (basePrice * selectedOffer.discount_value) / 100;
    } else {
      discountAmount = selectedOffer.discount_value;
    }
    const finalPrice = Math.max(0, basePrice - discountAmount);
    return { basePrice, discountAmount, finalPrice };
  };

  const confirmPlanAssignment = () => {
    if (!selectedPlan || !selectedDuration) {
      showError("Please select a plan and duration");
      return;
    }
    const priceDetails = calculatePlanPrice();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedDuration.duration_days);
    handleAction('assign_plan', {
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      duration_id: selectedDuration.id,
      duration_days: selectedDuration.duration_days,
      offer_id: selectedOffer?.id || null,
      plan_start_date: startDate.toISOString(),
      plan_end_date: endDate.toISOString(),
      plan_amount: priceDetails.finalPrice,
      discount_amount: priceDetails.discountAmount,
    });
    setShowModal(false);
  };

  const openModal = (type: string, title: string, needReason: boolean = false) => {
    setReasonText("");
    setModalConfig({ type, title, needReason, isPlanModal: false });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalConfig(null);
    setSelectedPlan(null);
    setSelectedDuration(null);
    setSelectedOffer(null);
    setReasonText("");
  };

  const confirmAction = () => {
    if (modalConfig?.isPlanModal) {
      confirmPlanAssignment();
      return;
    }
    if (modalConfig?.needReason && !reasonText.trim()) {
      showError("Please provide a reason");
      return;
    }
    const data: any = {};
    if (modalConfig?.needReason && reasonText.trim()) {
      data.reason = reasonText.trim();
    }
    handleAction(modalConfig.type, data);
  };

  const openDocumentPreview = (url: string, type: string, name: string) => {
    setPreviewDocument({ url, type, name });
    setShowDocumentPreview(true);
  };

  const getButtonClass = (baseColor: string, disabled: boolean = false) => {
    if (disabled) return "inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 bg-gray-400 cursor-not-allowed text-white opacity-50";
    return `inline-flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${baseColor}`;
  };

  const getStatusBadgeClass = (type: string) => {
    const baseClass = "inline-flex items-center px-2 py-1 text-xs rounded-full";
    const statusConfig: any = {
      blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      deleted: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      caste_verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      caste_pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      caste_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      caste_not_submitted: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      document_verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      document_pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      document_rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      document_not_submitted: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      plan: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      plan_active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      plan_expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return `${baseClass} ${statusConfig[type]}`;
  };

  const getDiscountBadge = (offer: Offer) => {
    if (offer.discount_type === 1) return `${offer.discount_value}% OFF`;
    return `₹${offer.discount_value} OFF`;
  };

  const shouldShowPlanButton = () => !isDeleted;
  const shouldShowBlockButton = () => !isDeleted;
  const shouldShowDeleteButton = () => true;
  const shouldShowCasteVerificationButton = () => !isDeleted && !isBlocked && casteStatus !== 'verified' && !(casteStatus === 'pending' && isCasteFlagSent && !hasCasteDocument);
  const shouldShowCasteAcceptRejectButtons = () => hasCasteDocument && casteStatus === 'pending';
  const shouldShowCastePreviewButton = () => hasCasteDocument;
  const shouldShowDocumentVerificationButton = () => !isDeleted && !isBlocked && documentStatus !== 'verified' && !(documentStatus === 'pending' && isDocumentFlagSent && !hasDocument);
  const shouldShowDocumentAcceptRejectButtons = () => hasDocument && documentStatus === 'pending';
  const shouldShowDocumentPreviewButton = () => hasDocument;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/30 p-4 mb-6 transition-colors duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Actions</h3>
          <div className="flex gap-2">
            {isBlocked && <span className={getStatusBadgeClass("blocked")}><Ban className="h-3 w-3 mr-1" /> Blocked</span>}
            {isDeleted && <span className={getStatusBadgeClass("deleted")}><Trash2 className="h-3 w-3 mr-1" /> Deleted</span>}
            {!isBlocked && !isDeleted && <span className={getStatusBadgeClass("active")}><UserCheck className="h-3 w-3 mr-1" /> Active</span>}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {shouldShowPlanButton() && (
            <button onClick={openPlanModal} className={getButtonClass("bg-green-600 hover:bg-green-700 text-white")}>
              <Gift className="h-4 w-4 mr-2" />
              {adminActions?.current_plan_id ? 'Change Plan' : 'Assign Plan'}
            </button>
          )}

          {/* Add this button after the Assign/Change Plan button */}
          {canCancelPlan() && (
            <button 
              onClick={() => setShowCancelPlanConfirm(true)} 
              disabled={loading}
              className={getButtonClass("bg-red-600 hover:bg-red-700 text-white")}
            >
              <XOctagon className="h-4 w-4 mr-2" />
              Cancel Plan
            </button>
          )}

          {shouldShowBlockButton() && (isBlocked ? (
            <button onClick={() => openModal('unblock', 'Unblock Member', true)} className={getButtonClass("bg-green-600 hover:bg-green-700 text-white")}>
              <UserCheck className="h-4 w-4 mr-2" /> Unblock Member
            </button>
          ) : (
            <button onClick={() => openModal('block', 'Block Member', true)} className={getButtonClass("bg-red-600 hover:bg-red-700 text-white")}>
              <Ban className="h-4 w-4 mr-2" /> Block Member
            </button>
          ))}

          {shouldShowDeleteButton() && (isDeleted ? (
            <button onClick={() => openModal('restore', 'Restore Member', true)} className={getButtonClass("bg-blue-600 hover:bg-blue-700 text-white")}>
              <RotateCcw className="h-4 w-4 mr-2" /> Restore Member
            </button>
          ) : (
            <button onClick={() => openModal('delete', 'Delete Member', true)} className={getButtonClass("bg-gray-600 hover:bg-gray-700 text-white")}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Member
            </button>
          ))}

          {shouldShowCasteVerificationButton() && (
            <button onClick={() => openModal('send_caste_verification', 'Send Caste Verification Request', true)} className={getButtonClass("bg-blue-600 hover:bg-blue-700 text-white")} disabled={casteStatus === 'pending' && isCasteFlagSent}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              {casteStatus === 'pending' && isCasteFlagSent ? 'Request Pending' : casteStatus === 'rejected' ? 'Resend Caste Verification' : 'Send Caste Verification'}
            </button>
          )}

          {shouldShowCastePreviewButton() && (
            <>
              <button onClick={() => openDocumentPreview(getFullImageUrl(hasCasteDocument), 'caste', adminActions?.caste_verification_document_name || 'Caste Document')} className={getButtonClass("bg-purple-600 hover:bg-purple-700 text-white")}>
                <Eye className="h-4 w-4 mr-2" /> View Caste Document
              </button>
              {shouldShowCasteAcceptRejectButtons() && (
                <div className="inline-flex gap-2">
                  <button onClick={() => handleAction('accept_caste', {})} disabled={loading} className={getButtonClass("bg-green-600 hover:bg-green-700 text-white")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept Caste
                  </button>
                  <button onClick={() => openModal('reject_caste', 'Reject Caste Verification', true)} className={getButtonClass("bg-orange-600 hover:bg-orange-700 text-white")}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject Caste
                  </button>
                </div>
              )}
            </>
          )}

          {/* Cancel Plan Confirmation Modal */}
          {showCancelPlanConfirm && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <XOctagon className="h-6 w-6 text-red-600" />
                    Cancel Current Plan
                  </h3>
                  <button 
                    onClick={() => setShowCancelPlanConfirm(false)} 
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
          
                {/* Warning Message */}
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Are you sure you want to cancel this plan?
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        This action will immediately terminate the member's current plan. The member will lose access to all premium features.
                      </p>
                    </div>
                  </div>
                </div>
          
                {/* Current Plan Details */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Plan Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Member:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {memberData.first_name} {memberData.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {adminActions?.current_plan_name}
                      </span>
                    </div>
                    {adminActions?.plan_start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(adminActions.plan_start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {adminActions?.plan_end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(adminActions.plan_end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {adminActions?.plan_duration_days && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                        <span className="text-gray-900 dark:text-white">
                          {adminActions.plan_duration_days} days
                        </span>
                      </div>
                    )}
                    {adminActions?.plan_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          ₹{Number(adminActions.plan_amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {/* Days remaining */}
                    {isPlanActive(adminActions?.plan_end_date) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {Math.ceil((new Date(adminActions.plan_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                  
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelPlan}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XOctagon className="h-4 w-4" />
                        Confirm Cancel Plan
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCancelPlanConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Keep Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {shouldShowDocumentVerificationButton() && (
            <button onClick={() => openModal('send_document_verification', 'Send Document Verification Request', true)} className={getButtonClass("bg-indigo-600 hover:bg-indigo-700 text-white")} disabled={documentStatus === 'pending' && isDocumentFlagSent}>
              <FileText className="h-4 w-4 mr-2" />
              {documentStatus === 'pending' && isDocumentFlagSent ? 'Request Pending' : documentStatus === 'rejected' ? 'Resend Document Verification' : 'Send Document Verification'}
            </button>
          )}

          {shouldShowDocumentPreviewButton() && (
            <>
              <button onClick={() => openDocumentPreview(getFullImageUrl(hasDocument), 'document', adminActions?.document_verification_document_name || 'Verification Document')} className={getButtonClass("bg-purple-600 hover:bg-purple-700 text-white")}>
                <Eye className="h-4 w-4 mr-2" /> View Document
              </button>
              {shouldShowDocumentAcceptRejectButtons() && (
                <div className="inline-flex gap-2">
                  <button onClick={() => handleAction('accept_document', {})} disabled={loading} className={getButtonClass("bg-green-600 hover:bg-green-700 text-white")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Accept Document
                  </button>
                  <button onClick={() => openModal('reject_document', 'Reject Document Verification', true)} className={getButtonClass("bg-orange-600 hover:bg-orange-700 text-white")}>
                    <XCircle className="h-4 w-4 mr-2" /> Reject Document
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Status Information Cards */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Caste Status Card */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Caste Verification</span>
                <span className={getStatusBadgeClass(casteStatus === 'verified' ? 'caste_verified' : casteStatus === 'pending' ? 'caste_pending' : casteStatus === 'rejected' ? 'caste_rejected' : 'caste_not_submitted')}>
                  {casteStatus === 'verified' ? 'Verified' : casteStatus === 'pending' ? 'Pending' : casteStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
                </span>
              </div>
              {isCasteFlagSent && casteStatus === 'pending' && !hasCasteDocument && (
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center"><Clock className="h-3 w-3 mr-1" /> Request sent {casteFlagTime}</div>
              )}
              {hasCasteDocument && casteStatus === 'pending' && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center"><FileCheck className="h-3 w-3 mr-1" /> Document received, awaiting review</div>
              )}
              {casteStatus === 'rejected' && adminActions?.caste_verification_rejection_reason && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">Reason: {adminActions.caste_verification_rejection_reason}</div>
              )}
            </div>

            {/* Document Status Card */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Document Verification</span>
                <span className={getStatusBadgeClass(documentStatus === 'verified' ? 'document_verified' : documentStatus === 'pending' ? 'document_pending' : documentStatus === 'rejected' ? 'document_rejected' : 'document_not_submitted')}>
                  {documentStatus === 'verified' ? 'Verified' : documentStatus === 'pending' ? 'Pending' : documentStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
                </span>
              </div>
              {isDocumentFlagSent && documentStatus === 'pending' && !hasDocument && (
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center"><Clock className="h-3 w-3 mr-1" /> Request sent {documentFlagTime}</div>
              )}
              {hasDocument && documentStatus === 'pending' && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 flex items-center"><FileCheck className="h-3 w-3 mr-1" /> Document received, awaiting review</div>
              )}
              {documentStatus === 'rejected' && adminActions?.document_verification_rejection_reason && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">Reason: {adminActions.document_verification_rejection_reason}</div>
              )}
            </div>

            {/* Plan Status Card */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Plan</span>
                <span className={getStatusBadgeClass(adminActions?.current_plan_name ? (isPlanActive(adminActions.plan_end_date) ? 'plan_active' : 'plan_expired') : 'document_not_submitted')}>
                  {adminActions?.current_plan_name || 'No Plan'}
                </span>
              </div>
              {adminActions?.current_plan_name && (
                <>
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-1">
                    {adminActions.current_plan_name}
                  </div>
                  {adminActions.plan_start_date && adminActions.plan_end_date && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(adminActions.plan_start_date).toLocaleDateString()} - {new Date(adminActions.plan_end_date).toLocaleDateString()}
                    </div>
                  )}
                  
                  {/* Remaining Days Display */}
                  {adminActions.plan_end_date && (
                    <div className="text-xs mt-1">
                      {isPlanActive(adminActions.plan_end_date) ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Remaining: {Math.ceil((new Date(adminActions.plan_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Plan Expired
                        </span>
                      )}
                    </div>
                  )}
                  
                  {adminActions.plan_duration_days && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Duration: {adminActions.plan_duration_days} days
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {adminActions.plan_amount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        <IndianRupee className="h-3 w-3 inline mr-1" />
                        Amount: ₹{Number(adminActions.plan_amount).toLocaleString()}
                      </span>
                    )}
                    {adminActions.plan_discount_amount > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Discount: -₹{Number(adminActions.plan_discount_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History Section */}
          <div className="mt-4">
            <button
              onClick={togglePaymentHistory}
              className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              <History className="h-4 w-4" />
              Payment History
              {showPaymentHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showPaymentHistory && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden">
                {isFetchingHistory ? (
                  <div className="flex justify-center items-center py-6">
                    <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No payment history available
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Final</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Source</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {paymentHistory.map((payment) => {
                          const source = getPaymentSource(payment.notes);
                          const SourceIcon = source.icon;
                          return (
                            <tr key={payment.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                {formatDate(payment.createdAt)}
                              </td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400 font-mono">
                                {payment.razorpayOrderId?.substring(0, 16)}...
                              </td>
                              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                ₹{Number(payment.amount).toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-green-600 dark:text-green-400">
                                {payment.discountAmount > 0 ? `-₹${Number(payment.discountAmount).toLocaleString()}` : '-'}
                              </td>
                              <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400">
                                ₹{Number(payment.finalAmount).toLocaleString()}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center gap-1 text-xs ${source.color}`}>
                                  <SourceIcon className="h-3 w-3" />
                                  {source.source}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPaymentStatusColor(payment.status)}`}>
                                  {payment.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showModal && modalConfig?.isPlanModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {adminActions?.current_plan_id ? 'Change Plan' : 'Assign Plan'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {/* Member Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm"><strong>Member:</strong> {memberData.first_name} {memberData.last_name}</p>
              <p className="text-sm mt-1"><strong>Current Plan:</strong> {adminActions?.current_plan_name || 'None'}</p>
            </div>

            {isFetchingPlans ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* Plan Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {memberPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setSelectedDuration(null);
                        setSelectedOffer(null);
                      }}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                      }`}
                    >
                      {plan.best_offer && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-0.5 text-xs rounded-full">
                          {getDiscountBadge(plan.best_offer)}
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                      <div className="mt-2 text-lg font-bold text-purple-600">₹{plan.monthly_price}/mo</div>
                      {plan.features.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {plan.features.slice(0, 3).map(f => (
                            <li key={f.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                              <span className="text-purple-600 mt-0.5">✓</span> {f.name}
                            </li>
                          ))}
                        </ul>
                      )}
                      <button className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold ${
                        selectedPlan?.id === plan.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {selectedPlan?.id === plan.id ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Duration & Offer Selection */}
                {selectedPlan && (
                  <div className="border-t pt-4 space-y-4">
                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Duration:</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlan.durations.map((duration) => (
                          <button
                            key={duration.id}
                            onClick={() => {
                              setSelectedDuration(duration);
                              const applicableOffer = selectedPlan.offers.find(o =>
                                o.applicable_duration_ids.includes(duration.id)
                              );
                              setSelectedOffer(applicableOffer || null);
                            }}
                            className={`px-3 py-2 rounded-lg border text-sm ${
                              selectedDuration?.id === duration.id
                                ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                            }`}
                          >
                            {duration.display_name}
                            <span className="block text-xs text-gray-500">{duration.duration_days} days</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Offers */}
                    {selectedPlan.offers.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Available Offers:</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedOffer(null)}
                            className={`px-3 py-1.5 rounded-lg border text-xs ${
                              !selectedOffer
                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                : 'border-gray-200'
                            }`}
                          >
                            No Offer
                          </button>
                          {selectedPlan.offers.map((offer) => (
                            <button
                              key={offer.id}
                              onClick={() => setSelectedOffer(offer)}
                              disabled={selectedDuration ? !offer.applicable_duration_ids.includes(selectedDuration.id) : false}
                              className={`px-3 py-1.5 rounded-lg border text-xs ${
                                selectedOffer?.id === offer.id
                                  ? 'border-green-600 bg-green-50 text-green-700'
                                  : selectedDuration && !offer.applicable_duration_ids.includes(selectedDuration.id)
                                  ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              {offer.name} ({getDiscountBadge(offer)})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Summary */}
                    {selectedDuration && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Price Summary</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Base Price</span>
                            <span>₹{calculatePlanPrice().basePrice.toLocaleString()}</span>
                          </div>
                          {selectedOffer && calculatePlanPrice().discountAmount > 0 && (
                            <>
                              <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{calculatePlanPrice().discountAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Final Price</span>
                                <span className="text-purple-600">₹{calculatePlanPrice().finalPrice.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={confirmPlanAssignment}
                        disabled={!selectedPlan || !selectedDuration || loading}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : `Assign Plan${selectedDuration ? ` (₹${calculatePlanPrice().finalPrice.toLocaleString()})` : ''}`}
                      </button>
                      <button
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Standard Action Modal (for non-plan actions) */}
      {showModal && !modalConfig?.isPlanModal && modalConfig && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{modalConfig.title}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm"><strong>Member:</strong> {memberData.first_name} {memberData.last_name}</p>
              <p className="text-sm mt-1"><strong>Email:</strong> {memberData.email}</p>
              <p className="text-sm mt-1"><strong>Mobile:</strong> {memberData.mobile_no}</p>
              <p className="text-sm mt-1"><strong>Member ID:</strong> {memberId}</p>
            </div>
            {(modalConfig.type === 'delete' || modalConfig.type === 'block') && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{modalConfig.type === 'delete' ? '⚠️ Warning: This action will permanently delete the member account.' : '⚠️ Warning: Blocked members cannot access their account until unblocked.'}</p>
              </div>
            )}
            {modalConfig.needReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason <span className="text-red-500">*</span>:</label>
                <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} rows={3} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700" placeholder={`Enter reason for ${modalConfig.title.toLowerCase()}...`} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={confirmAction} disabled={loading || (modalConfig.needReason && !reasonText.trim())} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {loading ? <span className="flex items-center justify-center"><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Processing...</span> : "Confirm"}
              </button>
              <button onClick={closeModal} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal (unchanged) */}
      {showDocumentPreview && previewDocument && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Document Preview: {previewDocument.name}</h3>
              <button onClick={() => setShowDocumentPreview(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
              {previewDocument.url.match(/\.(jpg|jpeg|png)$/i) ? (
                <img src={previewDocument.url} alt="Document Preview" className="max-w-full h-auto mx-auto" />
              ) : (
                <iframe src={previewDocument.url} className="w-full h-[60vh] rounded-lg" title="Document Preview" />
              )}
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => window.open(previewDocument.url, '_blank')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"><Download className="h-4 w-4 inline mr-2" /> Open in New Window</button>
              <button onClick={() => setShowDocumentPreview(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}