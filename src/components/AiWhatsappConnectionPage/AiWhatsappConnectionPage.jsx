"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertCircle, Phone } from "lucide-react";
import { useGlobalContext } from "../Context";


export default function AiWhatsappConnectionPage() {
  const {pax26} = useGlobalContext();
  const isConnected = false; // replace with real state

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6"
    style={{backgroundColor:pax26.card}}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div  style={{color:pax26.textPrimary}}>
          <h1 className="text-2xl font-semibold">WhatsApp Connection</h1>
          <p className="text-gray-400 mt-1">
            Connect your business WhatsApp number to enable AI replies.
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <AlertCircle className="text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isConnected ? "Connected" : "Not Connected"}
                </p>
                <p className="text-sm text-gray-400">
                  {isConnected
                    ? "Your WhatsApp number is active and receiving messages."
                    : "No WhatsApp number connected yet."}
                </p>
              </div>
            </div>
            {isConnected && <Button variant="secondary">Disconnect</Button>}
          </CardContent>
        </div>

        {/* Connect WhatsApp */}
        {!isConnected && (
          <div className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-medium">Connect WhatsApp Number</h2>

              <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
                <Phone className="text-green-500" />
                <div>
                  <p className="text-sm font-medium">Use a Business Number</p>
                  <p className="text-xs text-gray-400">
                    Do not use your personal WhatsApp number.
                  </p>
                </div>
              </div>

              <Button pageTo={"/whatsapp-rules"} className="w-full rounded-xl">Connect WhatsApp</Button>

              <p className="text-xs text-gray-500">
                You’ll be redirected to Meta to whatsapp rules page.
              </p>
            </CardContent>
          </div>
        )}

        {/* Webhook Status */}
        <div className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium mb-2">Webhook Status</h2>
            <p className="text-sm text-gray-400">
              Incoming messages will be delivered to your Pax26 AI webhook.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm">Webhook not verified</span>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
