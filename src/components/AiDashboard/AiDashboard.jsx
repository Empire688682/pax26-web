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

export default function AiDashboard() {
  const { pax26, router, userData } = useGlobalContext();

  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = userData?.name?.split(" ")[0] || "User";

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const res = await fetch("/api/automations/all", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setAutomations(data.automations || []);
        }
      } catch (err) {
        console.error("Failed to fetch automations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomations();
  }, []);

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
          Manage your smart workflows powered by AI
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
              key={auto.automationId}
              className="rounded-2xl hover:shadow-md transition"
            >
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

      {/* Empty State */}
      {!loading && automations.length === 0 && (
        <Card className="rounded-2xl border-dashed max-w-3xl mx-auto">
          <CardContent className="p-10 text-center space-y-4 ">
            <Zap className="mx-auto text-gray-400" size={36} />
            <h3 className="font-semibold">No automations yet</h3>
            <p className="text-sm text-gray-500">
              Create your first automation to start saving time.
            </p>
            <Button
              className="rounded-xl flex gap-2 mx-auto"
              onClick={() => router.push("/ai-automations/home#Automations")}
            >
              <Plus size={16} />
              Create Automation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
