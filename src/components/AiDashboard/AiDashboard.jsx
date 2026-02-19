"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import { Zap, MessageCircle, Bot, ToggleLeft, ToggleRight } from "lucide-react";
import { useGlobalContext } from "../Context";

const automationIcons = [
  { type: "whatsapp_auto_reply", icon: <MessageCircle className="text-green-500" /> },
  { type: "follow_up", icon: <Zap className="text-orange-500" /> },
  { type: "business_ai_chatbox", icon: <Bot className="text-black-500" /> },
];

export default function AiDashboard() {
  const { pax26, router, userData } = useGlobalContext();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);

  const firstName = userData?.name?.split(" ")[0] || "User";

  useEffect(() => {
    const fetchAutomations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/automations/system/all");
        const data = await res.json();
        if (data.success) {
          // Filter only active automations and map with icon
          const usefulAutomations = data.automations
            .filter(a => a.active) // only active automations
            .map(auto => ({
              id: auto._id,
              automationId: auto._id,
              type: auto.type,
              name: auto.name,
              description: auto.description,
              enabled: auto.enabled ?? auto.defaultEnabled,
              trigger: auto.trigger,
              action: auto.action,
              meta: auto.meta || {},
              icon: automationIcons.find(a => a.type === auto.type)?.icon || <Bot className="text-gray-500" />,
            }));
          setAutomations(usefulAutomations);
        }
      } catch (error) {
        console.error("Error fetching automations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAutomations();
  }, []);

  const toggleAutomation = (id) => {
    setAutomations(prev =>
      prev.map(auto => auto.id === id ? { ...auto, enabled: !auto.enabled } : auto)
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col" style={{ color: pax26.textPrimary }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{firstName}.</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Welcome to your dashboard
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage your smart workflows powered by AI, use the buttons below to get started.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground" style={{ color: pax26.textPrimary }}>
              Loading automations...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Automations */}
      {!loading && automations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map(auto => (
            <Card key={auto.id} className="rounded-2xl hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                {/* Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    {auto.icon}
                  </div>

                  <div onClick={() => toggleAutomation(auto.id)} className="cursor-pointer">
                    {auto.enabled ? (
                      <ToggleRight className="text-green-500 w-10 h-6" />
                    ) : (
                      <ToggleLeft className="text-gray-400 w-10 h-6" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
                  {auto.name}
                </h3>

                {/* Description (optional) */}
                {auto.description && (
                  <p className="text-sm" style={{ color: pax26.textSecondary }}>
                    {auto.description}
                  </p>
                )}

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

                {/* Meta badge if requires training */}
                {auto.meta.requiresTraining && (
                  <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                    Needs Training
                  </span>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-xl w-full"
                    onClick={() => router.push(`/automations/${auto.automationId}`)}
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
