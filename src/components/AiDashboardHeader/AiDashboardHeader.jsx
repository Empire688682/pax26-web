"use client";

import { Bot, MessageCircle, Workflow, Zap, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useGlobalContext } from "../Context";

export default function AiDashboardHeader({
    title,
    description,
    buttonText,
    buttonPath,
    buttonIcon,
    active,
    executions,
    totalAutomations,
    handleAiEnabled
}) {
    const { pax26 } = useGlobalContext();

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
        <div className="max-w-7xl mx-auto px-4">

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
                        {title}.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm md:text-base text-muted-foreground"
                        style={{ color: pax26.textPrimary }}
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Right (CTA Button) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-shrink-0"
                >
                    <Button pageTo={buttonPath} onClick={handleAiEnabled}>
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                            {buttonIcon} {buttonText}
                        </div>
                    </Button>
                </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {/* Activate AI CTA */}
                <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className="border-dashed hover:shadow-xl transition h-full">
                        <CardContent className="flex flex-col items-start justify-between gap-4 p-6">
                            <Workflow className="h-10 w-10 text-primary mb-2" />
                            <div className="flex-1">
                                <p className="text-lg font-semibold mb-1">
                                    Activate AI Automation
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Unlock WhatsApp automation, AI chatbot & lead follow-ups
                                </p>
                            </div>
                            <Button className="mt-3 w-full" onClick={handleAiEnabled}>Activate</Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Automations */}
                <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className="h-full">
                        <CardContent className="flex flex-col items-start gap-2 p-6">
                            <Workflow className="h-8 w-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Total Automations</p>
                            <p className="text-2xl font-bold">{totalAutomations}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Active */}
                <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className="h-full">
                        <CardContent className="flex flex-col items-start gap-2 p-6">
                            <Play className="h-8 w-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Active</p>
                            <p className="text-2xl font-bold">{active}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Executions */}
                <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className="h-full">
                        <CardContent className="flex flex-col items-start gap-2 p-6">
                            <Zap className="h-8 w-8 text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Executions</p>
                            <p className="text-2xl font-bold">{executions}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
