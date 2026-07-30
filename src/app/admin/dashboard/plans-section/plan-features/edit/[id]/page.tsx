"use client";

import { useParams } from "next/navigation";
import PlanFeatureForm from "../../../components/PlanFeatureForm";

export default function EditPlanFeaturePage() {
  const params = useParams();
  const id = params?.id as string;

  return <PlanFeatureForm mode="edit" featureId={id} />;
}