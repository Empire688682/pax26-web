"use client";

import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import VerifyAccountContent from "@/components/VerifyAccountContent/VerifyAccountContent";
import { Suspense } from "react";

export default function VerifyAccountPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VerifyAccountContent />
        </Suspense>
    )
}
