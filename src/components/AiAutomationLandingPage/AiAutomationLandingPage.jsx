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
          WhatsApp & AI Automation for
          <span className="text-primary"> Growing Businesses</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8 text-lg"
          style={{ color: pax26.textPrimary }}
        >
          Automate WhatsApp replies, customer support, and lead follow-ups —
          so you close more sales without hiring more staff.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button pageTo="/home">Get Started</Button>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: MessageCircle,
            title: "WhatsApp Automation",
            desc: "Auto-replies, payment alerts, broadcasts, and customer support on WhatsApp."
          },
          {
            icon: Bot,
            title: "AI Chatbot",
            desc: "24/7 AI chatbot that answers questions and assists customers instantly."
          },
          {
            icon: Workflow,
            title: "Lead Follow-Up Automation",
            desc: "Automatically follow up interested customers and convert chats into sales."
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

      {/* ================= USE CASES ================= */}
      <section className="max-w-6xl mx-auto mt-28"
      style={{ color: pax26.textPrimary }}>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
          style={{ color: pax26.textPrimary }}
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
                <CardContent
                  className="p-6 font-medium"
                  style={{ color: pax26.textPrimary }}
                >
                  {text}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="max-w-6xl mx-auto mt-28 text-center"
      style={{ color: pax26.textPrimary }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <ShieldCheck
            className="mx-auto h-12 w-12 mb-4"
            style={{ color: pax26.textPrimary }}
          />
          <h3
            className="text-2xl font-semibold"
            style={{ color: pax26.textPrimary }}
          >
            Secure, Reliable & Scalable
          </h3>
          <p className="max-w-xl mx-auto mt-3">
            Your data and conversations are protected with secure infrastructure
            and controlled automation rules you manage yourself.
          </p>
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-6xl mx-auto mt-28 text-center pb-24"
      style={{ color: pax26.textPrimary }}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-10">
              <h2 className="text-3xl font-bold mb-4">
                Automate Conversations. Close More Sales.
              </h2>
              <p className="mb-6">
                Use WhatsApp and AI automation to respond faster,
                follow up smarter, and grow without stress.
              </p>
              <Button pageTo="/home">Create Automation</Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

    </div>
  );
}
