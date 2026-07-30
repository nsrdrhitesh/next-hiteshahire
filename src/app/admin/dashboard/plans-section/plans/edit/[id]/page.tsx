"use client";

import { useParams } from "next/navigation";
import PlanForm from "../../../components/PlanForm";
// import PlanForm from "../../components/PlanForm";

export default function EditPlanPage() {
  const params = useParams();
  const id = params?.id as string;

  return <PlanForm mode="edit" planId={id} />;
}