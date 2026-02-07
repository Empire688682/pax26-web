"use client";
import { CardContent, Card } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import { Bot, MessageCircle, Settings, BarChart3, Zap } from "lucide-react";
import { useGlobalContext } from "../Context";
import React, { useState, useEffect } from "react";
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
      const response = await fetch("/api/ai/handle-ai-enabled", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData?._id }),
      });
      const data = await response.json();
      if (data.success) {
        const savedData = localStorage.getItem("userData");
        if (savedData) {
          const parseData = JSON.parse(savedData);
          parseData.paxAI.enabled = data.aiEnabled;
          localStorage.setItem("userData", JSON.stringify(parseData));
          setUserData(parseData);
        }
        setEnabledAi(data.aiEnabled);
      } else {
        alert("Failed to toggle AI: " + data.message);
      }
    } catch (error) {
      console.log("Error enabling AI:", error);
      alert("Failed to toggle AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: pax26.bg }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-1xl md:text-2xl font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            Pax26 Smart Assist
          </h1>
          <p
            className="text-sm text-muted-foreground"
            style={{ color: pax26.textSecondary }}
          >
            AI automation for your business operations
          </p>
        </div>

        <Button
          action={handleAiEnabled}
          className="rounded-xl flex items-center gap-2"
        >
          {loading ? (
            <FaSpinner className="animate-spin text-white text-2xl" />
          ) : enabledAi ? (
            "Disable AI"
          ) : (
            "Enable AI"
          )}
        </Button>
      </div>

      {/* Status Cards */}
      {enabledAi ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* AI Status */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bot style={{ color: pax26.textPrimary }} />
                <div>
                  <p className="text-sm" style={{ color: pax26.textPrimary }}>
                    AI Status
                  </p>
                  <p className="font-semibold animate-pop text-green-500">
                    Active
                  </p>
                  <p className="text-xs text-gray-500">
                    Your AI assistant is enabled and ready to automate tasks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Today */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageCircle style={{ color: pax26.textPrimary }} />
                <div>
                  <p className="text-sm" style={{ color: pax26.textPrimary }}>
                    Messages Today
                  </p>
                  <p className="font-semibold" style={{ color: pax26.textSecondary }}>
                    124
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automations */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap style={{ color: pax26.textPrimary }} />
                <div>
                  <p className="text-sm" style={{ color: pax26.textPrimary }}>
                    Automations
                  </p>
                  <p className="font-semibold" style={{ color: pax26.textSecondary }}>
                    3 Active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency */}
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 style={{ color: pax26.textPrimary }} />
                <div>
                  <p className="text-sm" style={{ color: pax26.textPrimary }}>
                    Efficiency
                  </p>
                  <p className="font-semibold" style={{ color: pax26.textSecondary }}>
                    +42%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-6 text-center space-y-2">
            <Bot className="mx-auto text-gray-400" size={32} />
            <p className="font-semibold text-gray-700">AI is currently disabled</p>
            <p className="text-sm text-gray-500">
              Enable AI to view automation stats and performance insights.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Business AI Profile */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              AI Business Profile
            </h3>
            <p className="text-sm text-muted-foreground" style={{ color: pax26.textPrimary }}>
              Configure how AI represents your business
            </p>
            <Button
              disabled={!enabledAi}
              variant="outline"
              pageTo={"/profile"}
              className="w-full rounded-xl"
            >
              Configure
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Automation */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              WhatsApp Automation
            </h3>
            <p className="text-sm text-muted-foreground" style={{ color: pax26.textPrimary }}>
              Connect WhatsApp and enable auto-replies
            </p>
            <Button
              disabled={!enabledAi}
              variant="outline"
              pageTo={"/whatsapp"}
              className="w-full rounded-xl"
            >
              Connect WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              AI Settings
            </h3>
            <p className="text-sm text-muted-foreground" style={{ color: pax26.textPrimary }}>
              Personality, tone, fallback rules
            </p>
            <Button
              disabled={!enabledAi}
              variant="outline"
              pageTo={"/settings"}
              className="w-full rounded-xl"
            >
              Manage AI
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Automations */}
      {enabledAi && (
        <Card className="rounded-2xl mt-4">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              Active Automations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border" style={{ color: pax26.textSecondary }}>
                Auto WhatsApp Replies
              </div>
              <div className="p-4 rounded-xl border" style={{ color: pax26.textSecondary }}>
                AI Customer Support
              </div>
              <div className="p-4 rounded-xl border" style={{ color: pax26.textSecondary }}>
                Lead Capture Automation
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription */}
      <Card className="rounded-2xl mt-4">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ color: pax26.textPrimary }}>
              AI Plan
            </h3>
            <p className="text-sm text-muted-foreground" style={{ color: pax26.textPrimary }}>
              Business Plan · ₦25,000/month
            </p>
          </div>
          <Button className="rounded-xl">Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
