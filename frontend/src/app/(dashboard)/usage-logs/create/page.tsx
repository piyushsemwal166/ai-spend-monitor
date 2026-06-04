"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";

export default function CreateUsageLogPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/usage-logs");
  }, [router]);

  return (
    <EmptyState
      title="Usage Logs are read-only"
      description="Usage logs are automatically created when models are executed through the Gateway. They cannot be manually created."
      actionLabel="View Usage Logs"
      actionHref="/usage-logs"
    />
  );
}