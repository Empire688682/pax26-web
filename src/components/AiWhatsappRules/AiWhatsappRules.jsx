"use client";
import { Card, CardContent } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { MessageCircle } from "lucide-react";
import { useGlobalContext } from "@/components/Context";

export default function WhatsAppAutomationRulesPage() {
  const { pax26, isWhatsappAiConnected } = useGlobalContext();

  if (!isWhatsappAiConnected) {
  return (
    <div className="p-6 rounded-xl">
      <p className="text-sm text-red-500">
        Please connect your WhatsApp number before setting automation rules.
      </p>
      <Button pageTo="/ai/whatsapp/connect">
        Connect WhatsApp
      </Button>
    </div>
  );
}


  return (
     <div className="p-6 space-y-6 md:max-w-4xl min-h-[70vh] rounded-xl max-w-2xl mx-auto"
    style={{backgroundColor:pax26.card}}
    >
      <div style={{color:pax26.textPrimary}}>
        <h1 className="text-2xl font-semibold" style={{ color: pax26.textPrimary }}>
          WhatsApp Automation
        </h1>
        <p className="text-sm" style={{ color: pax26.textSecondary }}>
          Automate WhatsApp customer conversations
        </p>
      </div>

      <div>
        <CardContent className="py-5 space-y-4">
          <div className="flex items-center gap-3">
            <MessageCircle style={{color:pax26.textPrimary}}/>
            <div style={{color:pax26.textPrimary}}>
              <p className="font-semibold">WhatsApp Status</p>
              <p className="text-sm text-red-500">Not Connected</p>
            </div>
          </div>

          <Button className="rounded-xl w-full">
            Connect WhatsApp Business
          </Button>
          <p className="text-xs text-gray-500">
                You’ll be redirected to Meta number verification page.
              </p>
        </CardContent>
      </div>

      <div>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold"
          style={{color:pax26.textPrimary}}>Auto Reply Settings</h3>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Greeting Message</label>
            <textarea
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              rows={3}
              placeholder="Hello 👋 Welcome to Pax26. How can I help you?"
            />
          </div>

          <div style={{color:pax26.textPrimary}}>
            <label className="text-sm">Fallback Message</label>
            <textarea
              className="w-full mt-1 p-3 rounded-xl border-gray-400 border bg-transparent"
              rows={3}
              placeholder="Sorry, I didn’t understand that. Can you rephrase?"
            />
          </div>

          <Button className="rounded-xl w-full">
            Save WhatsApp Rules
          </Button>
        </CardContent>
      </div>
    </div>
  );
}
