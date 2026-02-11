"use client";

import { Bot, Zap, MessageCircle, Workflow, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Cards";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";

export default function AiAutomationLandingPage() {
  const {pax26} = useGlobalContext();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold mb-6"
          style={{color:pax26.textPrimary}}
        >
          AI Automation for <span className="text-primary">Smart Businesses</span>
        </motion.h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg"
         style={{color:pax26.textPrimary}}>
          Automate workflows, WhatsApp messaging, customer support, and business operations with Pax26 AI Automation.
        </p>
        <div className="flex justify-center gap-4">
          <Button pageTo={"/home"}>Get Started</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
        {[
          {
          icon: MessageCircle,
          title: "WhatsApp Automation",
          desc: "Automate customer chats, OTPs, alerts, and support on WhatsApp."
        },
          {
          icon: Bot,
          title: "AI Agents",
          desc: "Smart AI agents that respond, assist, and take actions automatically."
        }, {
          icon: Workflow,
          title: "Workflow Automation",
          desc: "Connect payments, forms, messages, and tasks without manual effort."
        }].map((item, i) => (
          <Card key={i} className="hover:shadow-xl transition">
            <CardContent className="p-6">
              <item.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2"
               style={{color:pax26.textPrimary}}>{item.title}</h3>
              <p className="text-muted-foreground"
               style={{color:pax26.textPrimary}}>{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto mt-24">
        <h2 className="text-3xl font-bold text-center mb-12"
        style={{color:pax26.textPrimary}}>What You Can Automate</h2>
        <div className="grid md:grid-cols-2 gap-8" style={{color:pax26.textPrimary}}>
          <Card><CardContent className="p-6">Customer Support Automation</CardContent></Card>
          <Card><CardContent className="p-6">Payment & Wallet Notifications</CardContent></Card>
          <Card><CardContent className="p-6">Lead Capture & Follow-ups</CardContent></Card>
          <Card><CardContent className="p-6">Internal Operations & Reporting</CardContent></Card>
        </div>
      </section>

      {/* Security */}
      <section className="max-w-6xl mx-auto mt-24 text-center">
        <ShieldCheck 
        style={{color:pax26.textPrimary}}
        className="mx-auto h-12 w-12 text-primary mb-4" />
        <h3 className="text-2xl font-semibold"
         style={{color:pax26.textPrimary}}>Secure, Reliable & Scalable</h3>
        <p className="text-muted-foreground max-w-xl mx-auto mt-3"
         style={{color:pax26.textPrimary}}>
          Enterprise-grade security with full control over your automations and data.
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto mt-24 text-center">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-10">
            <h2 className="text-3xl font-bold mb-4"
             style={{color:pax26.textPrimary}}>Start Automating Today</h2>
            <p className="mb-6"
             style={{color:pax26.textPrimary}}>Build smarter systems, reduce costs, and scale faster with Pax26 AI.</p>
            <Button pageTo={"/home"}>Create Automation</Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
