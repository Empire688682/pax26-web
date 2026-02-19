"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import {
  Bot,
  MessageCircle,
  Settings,
  Zap,
  Workflow 
} from "lucide-react";
import { useGlobalContext } from "../Context";
import { motion } from "framer-motion";

export default function AiAutomationHomePage() {
  const { pax26, router, setUserData, userData } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [enabledAi, setEnabledAi] = useState(true);
  const [businessProfile, setBusinessProfile] = useState(null);

  useEffect(() => {
    setEnabledAi(userData?.paxAI?.enabled || false);
  }, [userData]);

  async function handleAiEnabled() {
    try {
      setLoading(true);
      const res = await fetch("/api/automations/handle-ai-enabled", {
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
  };

  const fetchBusinessProfile = async () => {
    try {
      const res = await fetch("/api/automations/get-business-profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setBusinessProfile(data.profile);
      } else {
        console.error("Failed to fetch business profile:", data.message);
        alert("Failed to fetch business profile: " + data.message);
      }
    } catch (error) {
      console.error("Error fetching business profile:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  // Motion variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        {/* Left (Title + Desc) */}
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: pax26.textPrimary }}
          >
            Create automation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-muted-foreground"
            style={{ color: pax26.textPrimary }}
          >
            Create and manage smart workflows powered by AI
          </motion.p>
        </div>

        {/* Right (CTA Button) */}
        {
          handleAiEnabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              <Button pageTo={"/"} onClick={handleAiEnabled}>

                <div className="flex items-center gap-2 text-xs md:text-sm">
                  {
                    loading ? "Processing..." : enabledAi ? "Deactivate AI" : "Activate AI"
                  } </div>
              </Button>
            </motion.div>
          )
        }
      </div>



      {/* Integrations Grid (Chatbase Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Activate AI CTA */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="border-dashed hover:shadow-xl transition h-full">
            <CardContent className="flex flex-col items-start gap-4 p-6 h-full">
              {/* Icon */}
              <div className="p-3 rounded-xl bg-primary/10">
                <Workflow className="h-8 w-8 text-primary" 
                style={{ color: pax26.textPrimary }}/>
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-lg font-semibold leading-tight mb-1"
                style={{ color: pax26.textPrimary }}>
                  Your AI Automations
                </p>
                <p className="text-sm text-muted-foreground"
                style={{ color: pax26.textPrimary }}>
                  View and manage all your active AI-powered workflows in one place.
                </p>
              </div>

              {/* Navigation CTA */}
              <Button
                disabled={!enabledAi}
                pageTo={"/dashboard"}
                className="w-full mt-auto"
              >
               Create Ai Workflows
              </Button>
            </CardContent>

          </Card>
        </motion.div>

        {/* Business Profile */}
        <IntegrationCard
          lastUpdated={businessProfile?.lastUpdated}
          icon={<Settings />}
          title="AI Business Training"
          description="Set your business details, tone, services, and rules so the AI responds exactly like your brand."
          buttonText="Setup"
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/training")}
        />

        {/* WhatsApp */}
        <IntegrationCard
          icon={<MessageCircle className="text-green-500" />}
          title="WhatsApp"
          description="Connect WhatsApp to automate replies, handle customer chats, and respond instantly using AI."
          buttonText={enabledAi ? "Connect WhatsApp" : "Subscribe to enable"}
          disabled={!enabledAi}
          onClick={() => router.push("/ai-automations/whatsapp")}
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
          onClick={() => router.push("/ai-automations/dashboard")}
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
  lastUpdated
}) {
  const { pax26 } = useGlobalContext();
  return (
    <Card className="rounded-2xl hover:shadow-md transition">
      <CardContent className="py-6 space-y-4">
        <div className="flex items-center justify-between space-x-3">
          <p className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">{icon}</p>
          <p
            style={{ color: pax26.textPrimary }}
            className={`text-xs ${lastUpdated ? 'flex' : 'hidden'}`}>
            Last Trained: {new Date(lastUpdated).toLocaleString() || "N/A"}
          </p>
        </div>

        <div>
          <h3 className="font-semibold"
            style={{ color: pax26.textPrimary }}>{title}</h3>
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
