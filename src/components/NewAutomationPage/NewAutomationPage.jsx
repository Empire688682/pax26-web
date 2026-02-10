"use client";

import React, { useState } from "react";
import { Card, CardContent } from "../ui/Cards";
import { Button } from "@/components/ui/Button";
import {
  Zap,
  MessageCircle,
  Bot,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useGlobalContext } from "../Context";

export default function NewAutomationPage() {
  const { pax26, router } = useGlobalContext();

  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [enabled, setEnabled] = useState(true);

  function handleSave() {
    // API integration later
    console.log({
      name,
      trigger,
      action,
      enabled,
    });

    alert("Automation created (UI only)");
    router.push("/automations");
  }

  return (
    <div className="p-6 space-y-8" style={{ backgroundColor: pax26.bg }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
        </Button>

        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            New Automation
          </h1>
          <p
            className="text-sm"
            style={{ color: pax26.textSecondary }}
          >
            Build a smart workflow for your AI agent
          </p>
        </div>
      </div>

      {/* Automation Form */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Automation Name</label>
            <input
              type="text"
              placeholder="e.g. Auto WhatsApp Replies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* Trigger */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>

              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              >
                <option value="">Select a trigger</option>
                <option value="whatsapp_message">
                  Incoming WhatsApp Message
                </option>
                <option value="new_conversation">
                  New Conversation Started
                </option>
                <option value="keyword_detected">
                  Keyword Detected
                </option>
              </select>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Bot size={18} />
              </div>

              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              >
                <option value="">Select an action</option>
                <option value="ai_reply">
                  AI Reply Automatically
                </option>
                <option value="handoff">
                  Handoff to Human
                </option>
                <option value="save_lead">
                  Save Lead Information
                </option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <Zap className="text-orange-500" />
              <div>
                <p className="font-medium">Enable Automation</p>
                <p className="text-xs text-gray-500">
                  Turn this automation on immediately
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={enabled}
              onChange={() => setEnabled(!enabled)}
              className="w-5 h-5"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl flex items-center gap-2"
              onClick={handleSave}
              disabled={!name || !trigger || !action}
            >
              <Save size={16} />
              Save Automation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
