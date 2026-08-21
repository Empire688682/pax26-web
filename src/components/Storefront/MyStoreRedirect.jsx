"use client";

import { useEffect, useState } from "react";
import { useGlobalContext } from "@/components/Context";

/**
 * MyStoreRedirect
 *
 * Authenticated page at /dashboard/my-store.
 * Fetches the logged-in seller's slug, then redirects them to
 * /store/{slug}?preview=1 so they see exactly what their
 * customers see — plus the owner preview banner rendered
 * by the storefront page itself.
 *
 * If no slug is set yet, shows a prompt to go configure one.
 */
export default function MyStoreRedirect() {
  const { pax26: p, router, userData } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    // Wait until userData context is loaded
    if (userData === undefined) return;

    async function fetchSlug() {
      setLoading(true);
      try {
        const res = await fetch("/api/seller/profile");
        const data = await res.json();
        if (data?.success && data?.profile?.slug) {
          setSlug(data.profile.slug);
          setRedirecting(true);
          router.push(`/store/${data.profile.slug}?preview=1`);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    if (userData?.paxAI?.businessType === "seller") {
      fetchSlug();
    } else {
      setLoading(false);
    }
  }, [userData, router]);

  if (loading || redirecting || slug) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", gap: "16px" }}>
        <div style={{ width: "32px", height: "32px", border: `3px solid ${p?.border || "#eee"}`, borderTopColor: p?.primary || "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <span style={{ fontSize: "14px", fontWeight: 600, color: p?.textPrimary || "#333", opacity: 0.7 }}>
          Loading your storefront…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // No slug configured yet
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: `${p?.primary || "#6366f1"}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", fontSize: "32px" }}>
        🏪
      </div>
      <h1 style={{ fontSize: "26px", fontWeight: 900, color: p?.textPrimary, margin: "0 0 12px", letterSpacing: "-0.03em" }}>
        You don't have a storefront yet
      </h1>
      <p style={{ fontSize: "15px", color: p?.textPrimary, opacity: 0.6, maxWidth: "400px", lineHeight: 1.7, margin: "0 0 32px" }}>
        Set up your store URL in the Agent Setup page under Business Info. It only takes a few seconds.
      </p>
      <button
        onClick={() => router.push("/dashboard/automations/ai-business-dashboard")}
        style={{ padding: "14px 32px", borderRadius: "16px", background: p?.primary || "#6366f1", color: "#fff", fontWeight: 800, fontSize: "15px", border: "none", cursor: "pointer", boxShadow: `0 10px 28px ${p?.primary || "#6366f1"}44` }}
      >
        Set Up My Store →
      </button>
    </div>
  );
}
