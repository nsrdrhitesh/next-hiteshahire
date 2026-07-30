"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from "../../../../lib/swalHelper";
import PageHeader from "@/app/admin/dashboard/components/ui/PageHeader";
import Script from "next/script";

type Feature = {
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

type Plan = {
  id: number;
  platform_id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  features: Feature[];
  durations: Duration[];
  offers: Offer[];
  best_offer?: Offer;
};

type PaymentHistory = {
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
  createdAt: string;
  updatedAt: string;
};

type ActivePlan = {
  current_plan_id: number | null;
  current_plan_name: string | null;
  plan_start_date: string | null;
  plan_end_date: string | null;
  plan_amount: number | null;
  plan_assigned_at: string | null;
};

export default function PlansPage() {
  const router = useRouter();
  const params = useParams();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const memberId = params.id ? Number(params.id) : undefined;

  // ==================== FETCH PLANS & PAYMENT HISTORY ====================
  useEffect(() => {
    if (!memberId) return;

    const fetchData = async () => {
      setIsFetching(true);
      setIsFetchingHistory(true);
      try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
          showError("Please login again");
          router.push("/login");
          return;
        }

        // Fetch plans and payment history in parallel
        const [plansRes, historyRes, memberDetailsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-get/plans/${memberId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/history/${memberId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/member-get/detail/${memberId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ),
        ]);

        if (plansRes.ok) {
          const json = await plansRes.json();
          if (json.success && json.data) {
            setPlans(json.data);
          }
        }

        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson.success && historyJson.data) {
            setPaymentHistory(historyJson.data);
          }
        }

        if (memberDetailsRes.ok) {
          const detailsJson = await memberDetailsRes.json();
          if (detailsJson.success && detailsJson.data) {
            // Extract admin actions with plan info
            const adminActions = detailsJson.data?.admin_actions;
            if (adminActions?.current_plan_id) {
              setActivePlan({
                current_plan_id: adminActions.current_plan_id,
                current_plan_name: adminActions.current_plan_name,
                plan_start_date: adminActions.plan_start_date,
                plan_end_date: adminActions.plan_end_date,
                plan_amount: adminActions.plan_amount,
                plan_assigned_at: adminActions.plan_assigned_at,
              });
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        showError(err.message || "Could not load data");
      } finally {
        setIsFetching(false);
        setIsFetchingHistory(false);
      }
    };

    fetchData();
  }, [memberId, router]);

  // ==================== CALCULATE PRICE ====================
  const calculatePrice = () => {
    if (!selectedPlan || !selectedDuration) return null;

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

  // ==================== RAZORPAY PAYMENT ====================
  const handlePayment = async () => {
    if (!selectedPlan || !selectedDuration) {
      showError("Please select a plan and duration");
      return;
    }

    setIsProcessing(true);

    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        showError("Please login again");
        router.push("/login");
        return;
      }

      const priceDetails = calculatePrice();
      if (!priceDetails) return;

      const payload = {
        amount: Number(priceDetails.finalPrice),
        discountAmount: Number(priceDetails.discountAmount || 0),
        planId: Number(selectedPlan.id),
        durationId: Number(selectedDuration.id),
        offerId: selectedOffer?.id ? Number(selectedOffer.id) : 0,
        memberId: Number(memberId),
      };

      const orderRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create order");
      }

      const orderData = await orderRes.json();

      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key not configured");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.data?.amount || orderData.amount,
        currency: orderData.data?.currency || orderData.currency || "INR",
        name: "Matrimony Platform",
        description: `${selectedPlan.name} - ${selectedDuration.display_name}`,
        order_id: orderData.data?.id || orderData.id,
        handler: async function (response: any) {
          try {
            const verifyPayload = {
              razorpay_order_id: String(response.razorpay_order_id),
              razorpay_payment_id: String(response.razorpay_payment_id),
              razorpay_signature: String(response.razorpay_signature),
              planId: Number(selectedPlan.id),
              durationId: Number(selectedDuration.id),
              offerId: selectedOffer?.id ? Number(selectedOffer.id) : 0,
              memberId: Number(memberId),
            };

            const verifyRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/payment/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(verifyPayload),
              }
            );

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              throw new Error(errData.message || "Payment verification failed");
            }

            showSuccess("Payment successful! Plan activated.");
            setTimeout(() => {
              router.push(`/admin/dashboard/members/${memberId}`);
            }, 1500);
          } catch (err: any) {
            console.error("Verification error:", err);
            showError(err.message || "Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        prefill: {
          name: "Member",
          email: "member@example.com",
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        showError(response.error.description || "Payment failed");
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      showError(err.message || "Payment initiation failed");
      setIsProcessing(false);
    }
  };

  // ==================== HANDLE BACK ====================
  const handleBack = () => {
    router.push(`/admin/dashboard/members/create/${params.id}/gallery-photos`);
  };

  // ==================== UI HELPERS ====================
  const getDiscountBadge = (offer: Offer) => {
    if (offer.discount_type === 1) {
      return `${offer.discount_value}% OFF`;
    }
    return `₹${offer.discount_value} OFF`;
  };

  const getOfferColor = (offer: Offer) => {
    if (offer.discount_type === 1 && offer.discount_value >= 30) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    if (offer.discount_type === 1 && offer.discount_value >= 20) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }
    return "bg-green-100 text-green-800 border-green-300";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'created': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isPlanActive = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  // ==================== RENDER ====================
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="space-y-6 p-4 md:p-6">
        {/* Header & Progress */}
        <PageHeader
          title="Choose Your Plan"
          breadcrumbItems={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Members", href: "/admin/dashboard/members" },
            { label: "Plans" },
          ]}
          step={{ current: 10, total: 10, description: "Select Plan & Pay" }}
        />

        <div className="flex justify-center px-4">
          <div className="flex w-full max-w-md gap-1.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 flex-1 rounded-full ${
                  i < 10 ? "bg-purple-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Active Plan Banner */}
        {activePlan?.current_plan_id && (
          <div className="max-w-6xl mx-auto">
            <div className={`rounded-2xl border-2 p-6 ${
              isPlanActive(activePlan.plan_end_date)
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700'
                : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isPlanActive(activePlan.plan_end_date)
                      ? 'bg-green-500'
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {activePlan.current_plan_name || 'Active Plan'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isPlanActive(activePlan.plan_end_date)
                          ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                          : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                      }`}>
                        {isPlanActive(activePlan.plan_end_date) ? 'ACTIVE' : 'EXPIRED'}
                      </span>
                      {activePlan.plan_amount && (
                        <span className="text-gray-600 dark:text-gray-400">
                          ₹{activePlan.plan_amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Start:</span> {formatDate(activePlan.plan_start_date)}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {formatDate(activePlan.plan_end_date)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Toggle */}
        {paymentHistory.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              <svg
                className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showHistory ? 'Hide' : 'View'} Payment History ({paymentHistory.length})
            </button>

            {showHistory && (
              <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Discount</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Final</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {payment.razorpayOrderId?.substring(0, 12)}...
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                            ₹{payment.amount}
                          </td>
                          <td className="px-4 py-3 text-green-600">
                            -₹{payment.discountAmount}
                          </td>
                          <td className="px-4 py-3 text-purple-600 font-semibold">
                            ₹{payment.finalAmount}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(payment.status)}`}>
                              {payment.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {formatDate(payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {isFetching ? (
          <div className="max-w-6xl mx-auto py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Loading available plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="max-w-6xl mx-auto py-20 text-center">
            <p className="text-gray-400 text-lg">No plans available at the moment</p>
          </div>
        ) : (
          <>
            {/* Plan Cards Grid */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  const isCurrentPlan = activePlan?.current_plan_id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setSelectedDuration(null);
                        setSelectedOffer(null);
                      }}
                      className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                        isCurrentPlan && isPlanActive(activePlan?.plan_end_date || null)
                          ? "border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/30"
                          : isSelected
                          ? "border-purple-600 shadow-lg shadow-purple-100 dark:shadow-purple-900/30 scale-[1.02]"
                          : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      {/* Current Plan Badge */}
                      {isCurrentPlan && isPlanActive(activePlan?.plan_end_date || null) && (
                        <div className="absolute top-0 left-0">
                          <div className="bg-green-500 text-white px-4 py-1 text-xs font-bold rounded-br-xl">
                            CURRENT PLAN
                          </div>
                        </div>
                      )}

                      {/* Best Offer Banner */}
                      {plan.best_offer && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1 text-xs font-bold rounded-bl-xl">
                            {getDiscountBadge(plan.best_offer)}
                          </div>
                        </div>
                      )}

                      <div className="p-6 pt-8">
                        {/* Plan Name */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[40px]">
                          {plan.description}
                        </p>

                        {/* Price */}
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₹{plan.monthly_price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            /month
                          </span>
                        </div>

                        {/* Offers */}
                        {plan.offers.length > 0 && (
                          <div className="mb-4 space-y-1.5">
                            {plan.offers.map((offer) => (
                              <span
                                key={offer.id}
                                className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getOfferColor(offer)}`}
                              >
                                {offer.name}: {getDiscountBadge(offer)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Features */}
                        {plan.features.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Features:
                            </p>
                            <ul className="space-y-1.5">
                              {plan.features.slice(0, 4).map((feature) => (
                                <li
                                  key={feature.id}
                                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                                >
                                  <span className="text-purple-600 mt-0.5">✓</span>
                                  <span>
                                    <strong>{feature.name}</strong>
                                    {feature.units && feature.units !== "-" && (
                                      <span className="text-gray-400">
                                        {" "}
                                        ({feature.units})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            {plan.features.length > 4 && (
                              <p className="text-xs text-purple-600 mt-1">
                                +{plan.features.length - 4} more features
                              </p>
                            )}
                          </div>
                        )}

                        {/* Select Button */}
                        <button
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isCurrentPlan && isPlanActive(activePlan?.plan_end_date || null)
                              ? "bg-green-500 text-white cursor-default"
                              : isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {isCurrentPlan && isPlanActive(activePlan?.plan_end_date || null)
                            ? "✓ Active Plan"
                            : isSelected
                            ? "✓ Selected"
                            : isCurrentPlan
                            ? "Renew Plan"
                            : "Select Plan"
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Duration & Offer Selection */}
            {selectedPlan && (
              <div className="max-w-6xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Configure Your Plan
                </h3>

                {/* Duration Selection */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Select Duration:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {selectedPlan.durations.map((duration) => {
                      const isDurationSelected = selectedDuration?.id === duration.id;
                      const hasDurationOffer = selectedPlan.offers.some((offer) =>
                        offer.applicable_duration_ids.includes(duration.id)
                      );

                      return (
                        <button
                          key={duration.id}
                          onClick={() => {
                            setSelectedDuration(duration);
                            const applicableOffer = selectedPlan.offers.find(
                              (offer) =>
                                offer.applicable_duration_ids.includes(duration.id)
                            );
                            setSelectedOffer(applicableOffer || null);
                          }}
                          className={`relative px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            isDurationSelected
                              ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "border-gray-200 hover:border-purple-300 text-gray-700 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          <span>{duration.display_name}</span>
                          <span className="block text-xs text-gray-500 mt-1">
                            {duration.duration_days} days
                          </span>
                          {hasDurationOffer && (
                            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              Offer
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Offer Selection */}
                {selectedPlan.offers.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Applicable Offers:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setSelectedOffer(null)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          !selectedOffer
                            ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-900/30"
                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                        }`}
                      >
                        No Offer (Full Price)
                      </button>
                      {selectedPlan.offers.map((offer) => {
                        const isApplicable = selectedDuration
                          ? offer.applicable_duration_ids.includes(selectedDuration.id)
                          : true;

                        return (
                          <button
                            key={offer.id}
                            onClick={() => setSelectedOffer(offer)}
                            disabled={!isApplicable}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                              selectedOffer?.id === offer.id
                                ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30"
                                : isApplicable
                                ? "border-gray-200 hover:border-green-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
                                : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
                            }`}
                          >
                            {offer.name} ({getDiscountBadge(offer)})
                            {!isApplicable && (
                              <span className="block text-xs text-red-400">
                                Not available for this duration
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                {selectedDuration && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Price Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Base Price</span>
                        <span>₹{calculatePrice()?.basePrice.toLocaleString()}</span>
                      </div>
                      {selectedOffer && calculatePrice()?.discountAmount! > 0 && (
                        <>
                          <div className="flex justify-between text-green-600">
                            <span>Discount ({selectedOffer.name})</span>
                            <span>-₹{calculatePrice()?.discountAmount.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                            <span>Final Price</span>
                            <span className="text-purple-600">
                              ₹{calculatePrice()?.finalPrice.toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {!selectedOffer && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                          <span>Total</span>
                          <span>₹{calculatePrice()?.basePrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 rounded-2xl border border-gray-300 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                ← Back to Gallery Photos
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={!selectedPlan || !selectedDuration || isProcessing}
                className={`flex-1 rounded-2xl py-4 text-base font-semibold transition-all ${
                  selectedPlan && selectedDuration
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${calculatePrice()?.finalPrice.toLocaleString() || 0} →`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}