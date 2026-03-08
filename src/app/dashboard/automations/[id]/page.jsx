"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Cards";
import { Bot, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { useGlobalContext } from "@/components/Context";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function AutomationViewPage() {
  const { pax26 } = useGlobalContext();
  const { id } = useParams();
  const [automation, setAutomation] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAutomation();
  }, [id]);

  if (loading)
    return (
      <div
        style={{ backgroundColor: pax26.secondaryBg }}
        className="text-muted px-6 flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    );

  if (!automation)
    return (
      <div
        style={{ backgroundColor: pax26.secondaryBg }}
        className="text-muted min-h-[50vh] px-6 flex items-center justify-center"
      >
        <p className="text-red-500">Automation not found</p>
      </div>
    );

  return (
    <div className="px-6"
      style={{ color: pax26.textPrimary, backgroundColor: pax26.secondaryBg }}>
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {/* Automation Info */}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bot /> {automation.name}
      </h1>

      <Card className="p-5 space-y-4">
        <div>
          <p className="text-sm text-muted">Trigger:</p>
          <p className="font-medium">{automation.trigger}</p>
        </div>

        <div>
          <p className="text-sm text-muted">Action:</p>
          <p className="font-medium">{automation.action}</p>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted">Status:</p>
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

      {/* Analytics Section */}
      {analytics && (
        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap /> Analytics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted">Total Runs</p>
              <p className="font-medium">{analytics.totalRuns}</p>
            </div>

            <div>
              <p className="text-sm text-muted">Successful Runs</p>
              <p className="font-medium">{analytics.successRuns}</p>
            </div>

            <div>
              <p className="text-sm text-muted">Success Rate</p>
              <p className="font-medium">{analytics.successRate}%</p>
            </div>

            <div>
              <p className="text-sm text-muted">Avg Response Time</p>
              <p className="font-medium">{analytics.avgResponseTime} ms</p>
            </div>
          </div>

          {/* Recent Executions */}
          <div>
            <p className="text-sm text-muted">Recent Executions</p>
            {analytics.recentExecutions.length ? (
              <ul className="text-sm list-disc ml-5 mt-2 text-muted">
                {analytics.recentExecutions.map((exec) => (
                  <li key={exec._id}>
                    <span className="font-medium">{exec.status}</span> -{" "}
                    {new Date(exec.executedAt).toLocaleString()} -{" "}
                    Response: {exec.responseTime} ms
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No executions yet.</p>
            )}
          </div>
        </Card>
      )}

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
    </div>
  );
}