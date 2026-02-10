"use client";

import React from "react";
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

export default function AiAutomations() {
  const { pax26, router } = useGlobalContext();

  // Dummy automations for now (replace with API later)
  const automations = [
    {
      id: 1,
      name: "Auto WhatsApp Replies",
      trigger: "Incoming WhatsApp message",
      action: "AI replies instantly",
      enabled: true,
    },
    {
      id: 2,
      name: "AI Customer Support",
      trigger: "Customer question detected",
      action: "Escalate or respond",
      enabled: true,
    },
    {
      id: 3,
      name: "Lead Capture Automation",
      trigger: "New conversation",
      action: "Save lead details",
      enabled: false,
    },
  ];

  return (
    <div className="p-6 space-y-8" style={{ backgroundColor: pax26.bg }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            Automations
          </h1>
          <p
            className="text-sm"
            style={{ color: pax26.textSecondary }}
          >
            Create and manage smart workflows
          </p>
        </div>

        <Button
          className="rounded-xl flex items-center gap-2"
          onClick={() => router.push("/ai-automation/new")}
        >
          <Plus size={16} />
          Create Automation
        </Button>
      </div>

      {/* Automations Grid */}
      {automations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((auto) => (
            <Card key={auto.id} className="rounded-2xl hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                {/* Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Zap className="text-orange-500" />
                  </div>

                  {auto.enabled ? (
                    <ToggleRight className="text-green-500" />
                  ) : (
                    <ToggleLeft className="text-gray-400" />
                  )}
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
                    {auto.name}
                  </h3>
                </div>

                {/* Flow */}
                <div className="text-sm space-y-2" style={{ color: pax26.textSecondary }}>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} />
                    <span><strong>Trigger:</strong> {auto.trigger}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot size={14} />
                    <span><strong>Action:</strong> {auto.action}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl w-full"
                    onClick={() => router.push(`/automations/${auto.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl w-full"
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-10 text-center space-y-4">
            <Zap className="mx-auto text-gray-400" size={36} />
            <h3 className="font-semibold">No automations yet</h3>
            <p className="text-sm text-gray-500">
              Create your first automation to start saving time.
            </p>
            <Button className="rounded-xl">
              <Plus size={16} />
              Create Automation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
