"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import {
  Zap,
  Plus,
  MessageCircle,
  Bot,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useGlobalContext } from "../Context";

const automationsData = [
  {
    id: "1",
    type: "whatsapp_auto_reply",
    name: "WhatsApp Auto Reply",
    description: "Instant AI replies to incoming messages",
    enabled: true,
    icon: <MessageCircle className="text-green-500" />,
    trigger: "Incoming WhatsApp message",
    action: "AI generates and sends reply"
  },
  {
    id: "2",
    type: "follow_up",
    name: "AI Follow-Up",
    description: "Automatically follow up with customers",
    icon: <Zap className="text-orange-500" />,
    trigger: "No response after 24 hours",
    action: "AI sends follow-up message"
  },
  {
    id: "3",
    type: "business_ai_chatbox",
    name: "Business AI Chatbox",
    description: "AI that chats like your business",
    icon: <Bot className="text-black-500" />,
    trigger: "User visits website",
    action: "AI chatbox engages visitor base on your business knowledge"
  },
]


export default function AiDashboard() {
  const { pax26, router, userData } = useGlobalContext();

  const [automations, setAutomations] = useState(automationsData);
  const [loading, setLoading] = useState(false);

  const firstName = userData?.name?.split(" ")[0] || "User";

  const toggleAutomation = (id) => {
    setAutomations((prev) =>
      prev.map((auto) => auto.id === id ? { ...auto, enabled: !auto.enabled } : auto)
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col" style={{ color: pax26.textPrimary }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {firstName}.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Welcome to your dashboard
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage your smart workflows powered by AI, use the right button below to get started.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground"
              style={{ color: pax26.textPrimary }}>
              Loading automations...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Automations */}
      {!loading && automations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((auto) => (
            <Card
              key={auto.id}
              className="rounded-2xl hover:shadow-md transition"
            >
              <CardContent className="p-6 space-y-4">
                {/* Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    {auto.icon}
                  </div>

                  <div onClick={()=>toggleAutomation}
                    className="cursor-pointer">
                    {auto.enabled ? (
                      <ToggleRight className="text-green-500 w-23 h-10" />
                    ) : (
                      <ToggleLeft className="text-gray-400 w-23 h-10" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3
                  className="font-semibold"
                  style={{ color: pax26.textPrimary }}
                >
                  {auto.name}
                </h3>

                {/* Flow */}
                <div
                  className="text-sm space-y-2"
                  style={{ color: pax26.textSecondary }}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} />
                    <span>
                      <strong>Trigger:</strong> {auto.trigger}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot size={14} />
                    <span>
                      <strong>Action:</strong> {auto.action}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl w-full"
                    onClick={() =>
                      router.push(`/automations/${auto.automationId}`)
                    }
                  >
                    View
                  </Button>

                  <Button
                    variant="outline"
                    className="rounded-xl w-full"
                    onClick={() => router.push("/training")}
                  >
                    Improve AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
