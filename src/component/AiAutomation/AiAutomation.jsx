"use client";
import {Card, CardContent} from "@/component/ui/Card";
import { Button } from "@/component/ui/Button";
import { Bot, MessageCircle, Settings, BarChart3, Zap } from "lucide-react";
import { useGlobalContext } from "../Context";

export default function AIAutomationPage() {
    const {pax26} = useGlobalContext();
  return (
    <div className="p-6 space-y-6"
    style={{backgroundColor: pax26.bg}}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold"
          style={{color: pax26.textPrimary}}>Pax26 Smart Assist</h1>
          <p className="text-sm text-muted-foreground"
          style={{color:pax26.textSecondary}}>AI automation for your business operations</p>
        </div>
        <Button className="rounded-xl">Enable AI</Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot style={{color:pax26.textPrimary}} />
              <div>
                <p className="text-sm"
                style={{color:pax26.textPrimary}}>AI Status</p>
                <p className="font-semibold text-green-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle  style={{color:pax26.textPrimary}}/>
              <div>
                <p className="text-sm"
                style={{color:pax26.textPrimary}}>Messages Today</p>
                <p className="font-semibold"
                style={{color:pax26.textSecondary}}>124</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap  style={{color:pax26.textPrimary}}/>
              <div>
                <p className="text-sm"
                style={{color:pax26.textPrimary}}>Automations</p>
                <p className="font-semibold"
                style={{color:pax26.textSecondary}}>3 Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3  style={{color:pax26.textPrimary}}/>
              <div>
                <p className="text-sm"
                style={{color:pax26.textPrimary}}>Efficiency</p>
                <p className="font-semibold"
                style={{color:pax26.textSecondary}}>+42%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business AI Profile */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold"
            style={{color:pax26.textPrimary}}>AI Business Profile</h3>
            <p className="text-sm text-muted-foreground"
            style={{color:pax26.textPrimary}}>Configure how AI represents your business</p>
            <Button variant="outline" className="w-full rounded-xl">Configure</Button>
          </CardContent>
        </Card>

        {/* WhatsApp Automation */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold"
            style={{color:pax26.textPrimary}}>WhatsApp Automation</h3>
            <p className="text-sm text-muted-foreground"
            style={{color:pax26.textPrimary}}>Connect WhatsApp and enable auto-replies</p>
            <Button variant="outline" className="w-full rounded-xl">Connect WhatsApp</Button>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold"
            style={{color:pax26.textPrimary}}>AI Settings</h3>
            <p className="text-sm text-muted-foreground"
            style={{color:pax26.textPrimary}}>Personality, tone, fallback rules</p>
            <Button variant="outline" className="w-full rounded-xl">Manage AI</Button>
          </CardContent>
        </Card>
      </div>

      {/* Automations */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold"
          style={{color:pax26.textPrimary}}>Active Automations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border"
            style={{color:pax26.textSecondary}}>Auto WhatsApp Replies</div>
            <div className="p-4 rounded-xl border"
            style={{color:pax26.textSecondary}}>AI Customer Support</div>
            <div className="p-4 rounded-xl border"
            style={{color:pax26.textSecondary}}>Lead Capture Automation</div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold"
            style={{color:pax26.textPrimary}}>AI Plan</h3>
            <p className="text-sm text-muted-foreground"
            style={{color:pax26.textPrimary}}>Business Plan · ₦25,000/month</p>
          </div>
          <Button className="rounded-xl">Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
