"use client";

import {Bot, MessageCircle, Workflow, Zap, Play, Pause, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { useGlobalContext } from "../Context";

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

export default function AiDashboardHeader({
    title,
    description,
    buttonText,
    buttonPath,
    buttonIcon,
    active,
    executions,
    totalAutomations,
    pageTo
}) {
    const { pax26 } = useGlobalContext();
    return (
        <div
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-10">
                <div>
                    <h1 className="md:text-3xl text-2xl font-bold"
                        style={{ color: pax26.textPrimary }}>{title}.</h1>
                    <p className="text-muted-foreground text-sm"
                        style={{ color: pax26.textPrimary }}>
                        {description}
                    </p>
                </div>
                    <Button pageTo={buttonPath}>
                        <p className="flex items-center gap-1">{buttonIcon} {buttonText}</p>
                    </Button>

            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-12"
                style={{ color: pax26.textPrimary }}>
                <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <Workflow className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Automations</p>
                                <p className="text-2xl font-bold">{totalAutomations}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <Play className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <Zap className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Executions</p>
                                <p className="text-2xl font-bold">{executions}</p>
                            </div>
                        </CardContent>
                    </Card>
            </div>
        </div>
    );
}
