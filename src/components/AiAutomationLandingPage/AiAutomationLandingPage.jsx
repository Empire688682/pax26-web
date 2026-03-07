"use client";

import { Bot, MessageCircle, Workflow, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Cards";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function AiAutomationLandingPage() {
  const { pax26 } = useGlobalContext();

  return (
    <div className="min-h-screen">

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto text-center pt-20">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6"
          style={{ color: pax26.textPrimary }}
        >
          Automate Your WhatsApp Business
          <span className="text-primary"> With AI</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8 text-lg"
          style={{ color: pax26.textPrimary }}
        >
          Automatically reply to customers, capture leads, and follow up with
          prospects on WhatsApp — so your business grows even while you sleep.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button pageTo="market-place">
            Start Automation
          </Button>
        </motion.div>
      </section>

      {/* ================= DEMO ================= */}
      <section className="max-w-6xl mx-auto mt-24 text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold mb-6"
          style={{ color: pax26.textPrimary }}
        >
          See Automation in Action
        </motion.h2>

        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src="/automation-demo.png"
            alt="Pax26 WhatsApp automation demo"
            className="w-full"
          />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: MessageCircle,
            title: "WhatsApp Automation",
            desc: "Automatically reply to customer messages, send broadcasts, and manage conversations."
          },
          {
            icon: Bot,
            title: "AI Chatbot",
            desc: "A 24/7 intelligent assistant that answers customer questions instantly."
          },
          {
            icon: Workflow,
            title: "Lead Follow-Up",
            desc: "Automatically follow up interested leads and turn chats into real sales."
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-xl transition h-full">
              <CardContent className="p-6">
                <item.icon
                  className="h-10 w-10 mb-4"
                  style={{ color: pax26.textPrimary }}
                />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: pax26.textPrimary }}
                >
                  {item.title}
                </h3>
                <p style={{ color: pax26.textPrimary }}>{item.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-6xl mx-auto mt-28 text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold mb-12"
          style={{ color: pax26.textPrimary }}
        >
          How Automation Works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Connect WhatsApp",
              desc: "Securely link your WhatsApp account to Pax26 automation."
            },
            {
              title: "Create Automation Rules",
              desc: "Set replies, triggers, and smart follow-up workflows."
            },
            {
              title: "Let AI Handle Conversations",
              desc: "Customers receive instant replies and automated follow-ups."
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p>{step.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= USE CASES ================= */}
      <section
        className="max-w-6xl mx-auto mt-28"
        style={{ color: pax26.textPrimary }}
      >
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          What You Can Automate
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            "WhatsApp Auto-Replies & Customer Support",
            "Payment, Order & Subscription Notifications",
            "Lead Capture & Smart Follow-Ups",
            "Appointment & Reminder Automation"
          ].map((text, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="p-6 font-medium">{text}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section
        className="max-w-6xl mx-auto mt-28 text-center"
        style={{ color: pax26.textPrimary }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <ShieldCheck className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-2xl font-semibold">
            Secure, Reliable & Scalable
          </h3>
          <p className="max-w-xl mx-auto mt-3">
            Your data and conversations are protected with secure infrastructure
            and controlled automation rules that you manage yourself.
          </p>
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section
        className="max-w-6xl mx-auto mt-28 text-center pb-24"
        style={{ color: pax26.textPrimary }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-10">
              <h2 className="text-3xl font-bold mb-4">
                Start Automating Your WhatsApp Today
              </h2>
              <p className="mb-6">
                Respond faster, capture more leads, and grow your business
                automatically with Pax26 AI automation.
              </p>
              <Button pageTo="market-place">
                Create Automation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

    </div>
  );
}