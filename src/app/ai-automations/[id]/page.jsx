"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Cards";
import { Bot, Zap, ToggleLeft, ToggleRight } from "lucide-react";

export default function AutomationViewPage() {
  const { id } = useParams();
  const [automation, setAutomation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const res = await fetch(`/api/automations/single?id=${id}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (data.success) {
          setAutomation(data.automation);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomation();
  }, [id]);

  if (loading) return <p className="text-muted">Loading automation...</p>;
  if (!automation) return <p className="text-red-500">Automation not found</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bot /> {automation.name}
      </h1>

      <Card className="p-5 space-y-4">
        <div>
          <p className="text-sm text-muted">Trigger</p>
          <p className="font-medium">{automation.trigger}</p>
        </div>

        <div>
          <p className="text-sm text-muted">Action</p>
          <p className="font-medium">{automation.action}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted">Status</p>
          {automation.enabled ? (
            <ToggleRight className="text-green-500" />
          ) : (
            <ToggleLeft className="text-gray-400" />
          )}
          <span className="text-sm">
            {automation.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </Card>

      {/* Future updates section */}
      <Card className="p-5 border-dashed">
        <p className="text-sm text-muted flex items-center gap-2">
          <Zap /> Future Updates
        </p>
        <ul className="text-sm list-disc ml-5 mt-2 text-muted">
          <li>Conditions & filters</li>
          <li>Execution logs</li>
          <li>Performance analytics</li>
          <li>Multi-channel triggers (WhatsApp, Web, API)</li>
        </ul>
      </Card>
    </div>
  );
}
