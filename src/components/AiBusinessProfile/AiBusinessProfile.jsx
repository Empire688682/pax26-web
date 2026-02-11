"use client";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { useGlobalContext } from "@/components/Context";

export default function AiBusinessProfile() {
  const { pax26 } = useGlobalContext();

  return (
   <div className=" space-y-6 md:max-w-4xl min-h-[70vh] rounded-xl max-w-2xl mx-auto"
    >
      <div style={{color:pax26.textPrimary}}
      className="bg-transparent">
        <h1 className="text-2xl font-semibold" style={{ color: pax26.textPrimary }}>
          AI Business Profile
        </h1>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          Configure how Pax26 AI represents your business
        </p>
      </div>

      <Card>
        <CardContent className="py-5 space-y-4">
          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Business Name</label>
            <input
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Pax26 Digital Services"
            />
          </div>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Business Description</label>
            <textarea
              rows={4}
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="We provide digital payments, utilities and automation services."
            />
          </div>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">AI Knowledge / FAQs</label>
            <textarea
              rows={6}
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              placeholder="Paste FAQs, policies, pricing, support info..."
            />
          </div>

          <Button className="rounded-xl w-full">
            Save Business Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
