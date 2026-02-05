"use client";
import { Card, CardContent } from "@/component/ui/Cards";
import { Button } from "@/component/ui/Button";
import { useGlobalContext } from "@/component/Context";

export default function AISettingsPage() {
  const { pax26 } = useGlobalContext();

  return (
    <div className="p-6 space-y-6 md:max-w-4xl min-h-[70vh] rounded-xl max-w-2xl mx-auto"
    style={{backgroundColor:pax26.card}}
    >
      <div style={{color:pax26.textPrimary}}
      className="bg-transparent">
        <h1 className="text-2xl font-semibold" style={{ color: pax26.textPrimary }}>
          AI Settings
        </h1>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          Control AI personality and behavior
        </p>
      </div>

      <div>
        <CardContent className="py-5 space-y-4">
          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">AI Tone</label>
            <select className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent">
              <option>Friendly</option>
              <option>Professional</option>
              <option>Strict</option>
            </select>
          </div>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Response Length</label>
            <select className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent">
              <option>Short</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
          </div>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Human Handoff Rule</label>
            <input
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Escalate after 3 failed replies"
            />
          </div>

          <Button className="rounded-xl w-full">
            Save AI Settings
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
