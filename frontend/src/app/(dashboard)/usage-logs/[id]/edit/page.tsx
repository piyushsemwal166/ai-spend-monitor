"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

export default function EditUsageLogPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/usage-logs");
  }, [router]);

  return (
    <EmptyState
      title="Usage Logs are read-only"
      description="Usage logs are automatically generated audit records and cannot be edited."
      actionLabel="View Usage Logs"
      actionHref="/usage-logs"
    />
  );
}