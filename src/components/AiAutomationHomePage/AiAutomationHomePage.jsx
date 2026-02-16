"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import {
  Bot,
  MessageCircle,
  Settings,
  Zap,
  BarChart3,
  Plus,
} from "lucide-react";
import { useGlobalContext } from "../Context";
import AiDashboardHeader from "../AiDashboardHeader/AiDashboardHeader";

export default function AiAutomationHomePage() {
  const { pax26, router, setUserData, userData } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [enabledAi, setEnabledAi] = useState(true);

  useEffect(() => {
    setEnabledAi(userData?.paxAI?.enabled || false);
  }, [userData]);

  async function handleAiEnabled() {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/handle-ai-enabled", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData?._id }),
      });
      const data = await res.json();

      if (data.success) {
        const saved = localStorage.getItem("userData");
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.paxAI.enabled = data.aiEnabled;
          localStorage.setItem("userData", JSON.stringify(parsed));
          setUserData(parsed);
        }
        setEnabledAi(data.aiEnabled);
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert("Failed to toggle AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AiDashboardHeader 
      title={"Create automation"}
      description={"Create and manage smart workflows powered by AI"}
      buttonText={"My automation"}
      buttonPath={"/dashboard"}
      buttonIcon={''}
      active={1}
      executions={200}
      totalAutomations={5}
      handleAiEnabled={handleAiEnabled}
      />

      {/* Integrations Grid (Chatbase Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* WhatsApp */}
        <IntegrationCard
          icon={<MessageCircle className="text-green-500" />}
          title="WhatsApp"
          description="Connect WhatsApp to automate replies, handle customer chats, and respond instantly using AI."
          buttonText={enabledAi ? "Connect WhatsApp" : "Subscribe to enable"}
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/whatsapp")}
        />

        {/* Business Profile */}
        <IntegrationCard
          icon={<Settings />}
          title="AI Business Training"
          description="Set your business details, tone, services, and rules so the AI responds exactly like your brand."
          buttonText="Setup"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/training")}
        />

        {/* AI chabot */}
        <IntegrationCard
          icon={<Bot />}
          title="AI Bot"
          description="Configure your AI chatbot’s tone, personality, and fallback rules for smart, human-like responses."
          buttonText="Open PaxAI Chatbot"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/pax")}
        />

        {/* Automations */}
        <IntegrationCard
          icon={<Zap className="text-orange-500" />}
          title="Lead Follows-up Automation"
          description="We automatically follow up with new leads, send reminders, and re-engage inactive prospects so you never miss a conversion opportunity."
          buttonText="View Automations"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/lead")}
        />
      </div>

      {/* Active Automations */}
      {enabledAi && (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              Active Automations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "Auto WhatsApp Replies",
                "AI Customer Support",
                "Lead Capture Automation",
              ].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-xl border text-sm"
                  style={{ color: pax26.textSecondary }}
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              AI Plan
            </h3>
            <p className="text-sm" style={{ color: pax26.textSecondary }}>
              Business Plan · ₦25,000 / month
            </p>
          </div>
          <Button className="rounded-xl">Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------------------------- */
/* Reusable Integration Card Component */
/* ---------------------------------- */

function IntegrationCard({
  icon,
  title,
  description,
  buttonText,
  disabled,
  onClick,
}) {
   const { pax26} = useGlobalContext();
  return (
    <Card className="rounded-2xl hover:shadow-md transition">
      <CardContent className="p-6 space-y-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold"
          style={{color:pax26.textPrimary}}>{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <Button
          variant="outline"
          disabled={disabled}
          onClick={onClick}
          className="w-full rounded-xl"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
