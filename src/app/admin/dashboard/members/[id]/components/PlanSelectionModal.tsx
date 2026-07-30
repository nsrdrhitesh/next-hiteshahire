// app/admin/dashboard/members/[id]/components/PlanSelectionModal.tsx
"use client";

import { useState, useEffect } from "react";

interface Plan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
}

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  onSelect: (plan: Plan) => void;
}

export default function PlanSelectionModal({ isOpen, onClose, memberId, onSelect }: PlanSelectionModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DATA_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setPlans(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans", error);
    }
  };

  const handleConfirm = () => {
    if (selectedPlan) {
      onSelect(selectedPlan);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Select a Plan</h3>
        
        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <label key={plan.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="plan"
                value={plan.id}
                onChange={() => setSelectedPlan(plan)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold">{plan.name}</div>
                <div className="text-sm text-gray-600">${plan.price} for {plan.duration_days} days</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!selectedPlan}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            Assign Plan
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}