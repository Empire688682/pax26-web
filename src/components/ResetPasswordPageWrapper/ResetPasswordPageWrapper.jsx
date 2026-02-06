"use client";
import { Suspense } from "react";
import ResetPasswordPage from "../ResetPasswordPage/ResetPasswordPage";

export default function ResetPasswordWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
