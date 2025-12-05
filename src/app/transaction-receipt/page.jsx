"use client";

import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";
import TransactionReceiptWrapper from "@/component/Wrappers/TransactionReceiptWrapper";
import { Suspense } from "react";

export default function Page() {
  LoadingSpinner
  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <TransactionReceiptWrapper />
    </Suspense>
  );
}
