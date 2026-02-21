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
  const { pax26, router, userData, isPaxAiBusinessTrained, setAIsPaxAiBusinessTrained } = useGlobalContext();
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const firstName = userData?.name?.split(" ")[0] || "User";

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automations/all");
      const data = await res.json();
      if (data.success) {
        console.log("automationsData: ", data.automations);
        // Filter only active automations and map with icon
        const usefulAutomations = data.automations
          .filter(a => a.active) // only active automations
          .map(auto => ({
            id: auto.automationId,
            automationId: auto.automationId,
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

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      try {
        const res = await fetch("/api/automations/get-business-profile", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const profile = data?.profile || {};
        if (data.success) {
          setAIsPaxAiBusinessTrained(profile.aiTrained || false);
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
      }
    };
    fetchBusinessProfile();
  }, [])

  const toggleAutomationAPI = async (automationId) => {
    if (!isPaxAiBusinessTrained) {
      alert("Please train PaxAI with your business information before enabling automations. Click OK to go to training page.");
      router.push("/ai-automations/training");
      return;
    }
    try {
      setToggling(true);
      const res = await fetch(`/api/automations/${automationId}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        await fetchAutomations(); // Refresh automations after toggling
      }
      else {
        console.error("Failed to toggle automation:", data.message);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error toggling automation:", error);
    } finally {
      setToggling(false);
    }
  }

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <Card className="rounded-2xl animate-pulse">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-gray-200" />
          <div className="w-10 h-6 rounded-full bg-gray-200" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-8 bg-gray-200 rounded w-full" />
      </CardContent>
    </Card>
  );

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

      {/* Automations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : (automations.map(auto => (
            <Card key={auto.automationId} className="rounded-2xl hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                {/* Icon + Status */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    {auto.icon}
                  </div>

                  {
                    toggling ? (
                      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-green-400 animate-spin"></div>
                    ) : (
                      <div onClick={() => toggleAutomationAPI(auto.id)} className="cursor-pointer">
                        {auto.enabled ? (
                          <ToggleRight className="text-green-500 w-15 h-10" />
                        ) : (
                          <ToggleLeft className="text-gray-400 w-15 h-10" />
                        )}
                      </div>
                    )
                  }
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
                  <div className="flex flex-wrap gap-2 justify-between">
                    <span className="inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded">
                      Needs Training
                    </span>
                    <p>
                      {
                        isPaxAiBusinessTrained ? <span className="inline-block cursor-pointer bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded">PaxAI is trained</span>
                          : <span
                            className="inline-block cursor-pointer bg-blue-600 text-white font-bold text-xs px-2 py-1 rounded"
                            onClick={() => router.push("/ai-automations/training#Pax")}>Train now</span>
                      }
                    </p>
                  </div>
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
                    onClick={() => router.push("/ai-automations/training")}
                  >
                    Improve AI
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
          )}
      </div>
    </div>
  );
}
