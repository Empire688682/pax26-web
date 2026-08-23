"use client";

import { useEffect } from "react";
import { useGlobalContext } from "@/components/Context";

export default function QueryHandler() {
  const { openModal } = useGlobalContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const refCode = searchParams.get("ref");

      if (refCode) {
        const expireIn = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 days
        localStorage.setItem(
          "ReferralCode",
          JSON.stringify({ refCode, expireIn })
        );
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const authQuery = searchParams.get("auth");
      if (authQuery === "login") {
        openModal("login");
      }
    }
  }, [openModal]);

  return null;
}
