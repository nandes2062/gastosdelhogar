"use client";

import { use } from "react";
import { ServiceBillPage } from "@/components/ServiceBillPage";

export default function DynamicServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  return <ServiceBillPage serviceId={serviceId} />;
}
