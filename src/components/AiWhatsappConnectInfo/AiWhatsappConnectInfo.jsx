"use client";
import React from "react";
import { CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import {
  Facebook,
  CheckCircle,
  ShieldCheck,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useGlobalContext } from "../Context";

export default function AiWhatsappConnectInfo() {
  const { pax26 } = useGlobalContext();

  return (
    <div
      className="space-y-8 h-full w-full md:max-w-3xl mx-auto rounded-xl shadow-lg"
      style={{ backgroundColor: pax26.card, color: pax26.textPrimary }}
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Connect WhatsApp to Pax26
        </h1>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          Pax26 connects to WhatsApp using Meta’s official Cloud API.
        </p>
      </div>

      {/* Why Meta */}
      <div
        className="rounded-xl"
        style={{ backgroundColor: pax26.secondaryBg }}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-500" />
            <h2 className="text-lg font-medium">
              Why Meta Login is Required
            </h2>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            WhatsApp does not allow third-party tools to access messages directly.
            Meta requires you to approve Pax26 so we can send and receive messages
            securely on your behalf.
          </p>

          <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>Your data stays protected</li>
            <li>No password sharing</li>
            <li>You can disconnect anytime</li>
          </ul>
        </CardContent>
      </div>

      {/* Business Requirement */}
      <div
        className="rounded-xl"
        style={{ backgroundColor: pax26.secondaryBg }}
      >
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="text-green-500" />
            <h2 className="text-lg font-medium">
              Do I Need a WhatsApp Business Account?
            </h2>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            Yes — but it’s easier than it sounds.
          </p>

          <ul className="text-sm text-gray-400 list-disc list-inside space-y-2">
            <li>
              You can use an <strong>existing WhatsApp Business number</strong>
            </li>
            <li>
              Or create a <strong>new Business number during setup</strong>
            </li>
            <li>
              Your <strong>personal WhatsApp account cannot be used</strong>
            </li>
          </ul>
        </CardContent>
      </div>

      {/* Step by step */}
      <div
        className="rounded-xl"
        style={{ backgroundColor: pax26.secondaryBg }}
      >
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-medium">How Connection Works</h2>

          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={16} />
              <p>Log in with Facebook (Meta)</p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={16} />
              <p>Select or create a WhatsApp Business account</p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={16} />
              <p>Verify a phone number</p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={16} />
              <p>Pax26 activates AI replies instantly</p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* CTA */}
      <div className="space-y-3">
        <Button
          className="w-full rounded-xl flex items-center justify-center gap-2"
        >
          <Facebook size={18} />
          Continue to Meta
          <ArrowRight size={16} />
        </Button>

        <p className="text-xs text-center text-gray-500">
          Powered by WhatsApp Cloud API • Official • Secure
        </p>
      </div>
    </div>
  );
}
