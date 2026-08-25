"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsappContactsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/automations/whatsapp-inbox");
  }, [router]);

  return null;
}
