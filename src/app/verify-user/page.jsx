"use client";

import LoadingSpinner from "@/component/LoadingSpinner/LoadingSpinner";
import VerifyAccountContent from "@/component/VerifyAccountContent/VerifyAccountContent";
import { Suspense } from "react";

export default function VerifyAccountPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <VerifyAccountContent />
        </Suspense>
    )
}
