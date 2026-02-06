"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Cards";
import { Play, Pause, ArrowRight, Cpu, Zap, Wallet, MessageCircle } from "lucide-react";
import { useGlobalContext } from "../Context";

const slides = [
  {
    id: 1,
    title: "One Platform. Payments, Utilities & AI",
    subtitle: "The Operating System for Digital Services",
    desc: "Pay bills, buy airtime, data, electricity, TV subscriptions and gift cards — now enhanced with AI-powered automation to save time and reduce stress.",
    icon: Zap
  },
  {
    id: 2,
    title: "Smart Payments",
    subtitle: "Built for Africa, Ready for the World",
    desc: "Wallets, transfers, airtime, data, electricity & TV bills — fast and secure.",
    icon: Wallet
  },
  {
    id: 3,
    title: "AI Automation",
    subtitle: "Let Bots Do the Work",
    desc: "Auto‑reply, lead follow‑ups, reminders, workflows, and smart triggers.",
    icon: Cpu
  },
  {
    id: 4,
    title: "Omni‑Channel Messaging",
    subtitle: "WhatsApp • SMS • Email",
    desc: "Engage users, verify numbers, and send notifications at scale.",
    icon: MessageCircle
  },
];

export default function Pax26Experience() {
    const {pax26} = useGlobalContext()
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [playing]);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div className="w-full min-h-[700px] relative shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${pax26.bg}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl w-full px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4">{slide.title}</h1>
              <h2 className="text-xl md:text-2xl opacity-90 mb-6">{slide.subtitle}</h2>
              <p className="text-lg opacity-90 max-w-xl mb-8">{slide.desc}</p>

              <div className="flex gap-4">
                <Button size="lg" className="bg-white text-black hover:bg-white/90">
                  Explore Platform <ArrowRight className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl w-full max-w-md">
                <CardContent className="p-10 text-center">
                  <Icon className="w-20 h-20 text-white mx-auto mb-6" />
                  <p className="text-white text-lg">
                    Everything inside Pax26 is modular, scalable, and API‑driven.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute top-6 right-6 flex gap-3 z-30">
        <Button
          size="icon"
          className="bg-black/40 text-white hover:bg-black/60"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-10 rounded-full transition-all ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
