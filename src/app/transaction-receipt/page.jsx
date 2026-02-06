"use client";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import TransactionReceiptWrapper from "@/components/Wrappers/TransactionReceiptWrapper";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <TransactionReceiptWrapper />
    </Suspense>
  );
}
