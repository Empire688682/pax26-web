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
  CheckCircle2,
} from "lucide-react";
import { useGlobalContext } from "../Context";
import { FaSpinner } from "react-icons/fa";

export default function AIAutomationPage() {
  const { pax26, router, setUserData, userData } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [enabledAi, setEnabledAi] = useState(false);

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
    <div className="p-6 space-y-8" style={{ backgroundColor: pax26.bg }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: pax26.textPrimary }}>
            Pax26 Agent
          </h1>
          <p className="text-sm" style={{ color: pax26.textSecondary }}>
            Connect AI channels and deploy smart automations
          </p>
        </div>

        <Button
          action={handleAiEnabled}
          className="rounded-xl flex items-center gap-2"
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : enabledAi ? (
            "Disable AI"
          ) : (
            "Enable AI"
          )}
        </Button>
      </div>

      {/* AI Status Banner */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot />
            <div>
              <p className="font-medium" style={{ color: pax26.textPrimary }}>
                AI Status
              </p>
              <p
                className={`text-sm ${
                  enabledAi ? "text-green-500" : "text-gray-500"
                }`}
              >
                {enabledAi ? "Active & running" : "Disabled"}
              </p>
            </div>
          </div>

          {enabledAi && (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle2 size={16} />
              Live
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrations Grid (Chatbase Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Business Profile */}
        <IntegrationCard
          icon={<Settings />}
          title="AI Business Profile"
          description="Define how your AI represents your business"
          buttonText="Setup"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automation/profile")}
        />

        {/* WhatsApp */}
        <IntegrationCard
          icon={<MessageCircle className="text-green-500" />}
          title="WhatsApp"
          description="Connect your agent to WhatsApp and reply to customers"
          buttonText={enabledAi ? "Connect WhatsApp" : "Subscribe to enable"}
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automation/whatsapp")}
        />

        {/* AI Settings */}
        <IntegrationCard
          icon={<Bot />}
          title="AI Settings"
          description="Tone, personality and fallback rules"
          buttonText="Manage AI"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automation/settings")}
        />

        {/* Automations */}
        <IntegrationCard
          icon={<Zap className="text-orange-500" />}
          title="Automations"
          description="Create and manage smart workflows"
          buttonText="View Automations"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automation/automations")}
        />

        {/* Analytics */}
        <IntegrationCard
          icon={<BarChart3 className="text-blue-500" />}
          title="Analytics"
          description="Messages, performance and efficiency stats"
          buttonText="View Analytics"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automation/analytics")}
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
