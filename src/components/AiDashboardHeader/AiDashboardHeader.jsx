"use client";

import { Plus, Bot, MessageCircle, Workflow, Zap, Play, Pause, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { useGlobalContext } from "../Context";
import { usePathname } from "next/navigation";

const automations = [
    {
        name: "WhatsApp OTP Sender",
        type: "WhatsApp",
        status: "Active",
        icon: MessageCircle,
    },
    {
        name: "Wallet Credit Alert",
        type: "Payments",
        status: "Paused",
        icon: Zap,
    },
    {
        name: "AI Customer Support",
        type: "AI Agent",
        status: "Active",
        icon: Bot,
    },
];

export default function AiDashboardHeader() {
    const { pax26 } = useGlobalContext();
    const pathName = usePathname();
    const isAiHomePage = pathName === "/ai-automations/home";
    return (
        <div
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-10">
                <div>
                    <h1 className="md:text-3xl text-2xl font-bold"
                        style={{ color: pax26.textPrimary }}>Automations</h1>
                    <p className="text-muted-foreground text-sm"
                        style={{ color: pax26.textPrimary }}>
                        Create and manage smart workflows powered by AI
                    </p>
                </div>
                {
                    !isAiHomePage &&
                    <Button size="lg">
                        <p className="flex items-center gap-1"><Plus /> New <span className="md:display hidden">Automation</span></p>
                    </Button>
                }

            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-12"
                style={{ color: pax26.textPrimary }}>
                {[{
                    label: "Total Automations",
                    value: 6,
                    icon: Workflow
                }, {
                    label: "Active",
                    value: 4,
                    icon: Play
                }, {
                    label: "Paused",
                    value: 2,
                    icon: Pause
                }, {
                    label: "Executions",
                    value: "12.4k",
                    icon: Zap
                }].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <stat.icon className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
