"use client";
import { CardContent } from "@/component/ui/Cards";
import { Button } from "@/component/ui/Button";
import { useGlobalContext } from "@/component/Context";

export default function AISettingsPage({handleInputChange, setAiData, aiData}) {
  const { pax26 } = useGlobalContext();

  const saveSettings = () => {
    if(!aiData.aiName || 
      !aiData.businessName || 
      !aiData.details || 
      !aiData.handoffRule || 
      !aiData.responseLength || 
      !aiData.tone) {
        alert("Please fill in all fields before saving.");
        return;
    }
    // Save to localStorage for now (replace with API call later)
    localStorage.setItem("aiData", JSON.stringify(aiData));
    alert("AI settings saved!");
  }

  return (
    <div
      className="p-6 space-y-6 h-full w-full md:max-w-3xl rounded-xl mx-auto shadow-lg"
      style={{ backgroundColor: pax26.card, color: pax26.textPrimary }}
    >
      <div style={{ color: pax26.textPrimary }}>
        <p className="text-1xl text-center font-semibold flex" style={{ color: pax26.textPrimary }}>
         Ai Trained
        </p>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          Last updated: June 26, 2024.
        </p>
      </div>

      <div>
        <CardContent className="py-5 space-y-4 md:space-y-6">
          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">Ai Name</label>
            <input
              name="aiName"
              onChange={(e) => handleInputChange("aiName", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Name for your AI assistant"
            />
          </div>

          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">Business Name</label>
            <input
              name="businessName"
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Your business name"
            />
          </div>
          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">AI Tone</label>
            <select 
            name="tone"
            onChange={()=>setAiData("tone", e.target.value)}
            className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent">
              <option>Friendly</option>
              <option>Professional</option>
              <option>Strict</option>
            </select>
          </div>

          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">Response Length</label>
            <select className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
            name="responseLength"
            onChange={()=>setAiData("responseLength", e.target.value)}>
              <option>Short</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
          </div>

          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">Details</label>
            <textarea
              name="details"
              onChange={(e) => handleInputChange("details", e.target.value)}
            placeholder="eg: Always greet customers by name. Use emojis for friendly tone. Avoid technical jargon..."
            className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              id="" cols="30" rows="4"></textarea>
          </div>

          <div style={{ color: pax26.textPrimary }}>
            <label className="text-sm">Human Handoff Rule</label>
            <input
              name="handoffRule"
              onChange={(e) => handleInputChange("handoffRule", e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Escalate after 3 failed replies"
            />
          </div>

          <Button action={saveSettings} className="rounded-xl w-full">
            Save AI Settings
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
