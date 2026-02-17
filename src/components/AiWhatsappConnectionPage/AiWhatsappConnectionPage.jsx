"use client";
import React,{useState} from "react";
import { CardContent, Card } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { CheckCircle, AlertCircle, Phone, ExternalLink } from "lucide-react";
import { useGlobalContext } from "../Context";

export default function AiWhatsappConnectionPage() {
  const {
    pax26,
    router,
    isWhatsappAiConnected,
    whatsappNumber,
  } = useGlobalContext();
  const [metaOauthUrl, setMetaOauthUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Meta OAuth URL and state generation moved to backend for security
const getMetaOauthUrl = async () => {
  setLoading(true)
  try {    const res = await fetch("/api/meta/oauth-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      setLoading(false)
      window.location.href = data.url;
    }
  } catch (err) {
    console.error("Failed to get Meta OAuth URL:", err);
  }finally{
    setLoading(false)
  }
};

  return (
    <div
      className="space-y-6 h-full w-full md:max-w-3xl rounded-xl mx-auto shadow-lg"
      style={{ color: pax26.textPrimary }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">WhatsApp Connection</h1>
        <p className="text-sm mt-1" style={{ color: pax26.textSecondary }}>
          Connect your WhatsApp Business number to enable AI replies.
        </p>
      </div>

      {/* Connection Status */}
      <Card className="rounded-xl">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWhatsappAiConnected ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <AlertCircle className="text-yellow-500" />
            )}

            <div>
              <p className="font-medium">
                {isWhatsappAiConnected ? "Connected" : "Not Connected"}
              </p>

              {isWhatsappAiConnected ? (
                <p className="text-sm text-gray-400">
                  Connected number:{" "}
                  <span className="text-green-400 font-medium">
                    {whatsappNumber || "+234 *** *** **45"}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  No WhatsApp number connected yet.
                </p>
              )}
            </div>
          </div>

          {isWhatsappAiConnected && (
            <Button variant="secondary">Disconnect</Button>
          )}
        </CardContent>
      </Card>

      {/* Connect WhatsApp */}
      {!isWhatsappAiConnected && (
        <Card className="rounded-xl">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-medium">Connect WhatsApp Business</h2>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-700/40">
              <Phone className="text-green-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-white">
                  Official WhatsApp Business connection
                </p>
                <p className="text-xs text-gray-200">
                  Personal WhatsApp numbers are not supported.
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium"
              style={{color:pax26.textPrimary}}>What happens next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You’ll log in with Facebook</li>
                <li>Create or select a Meta Business account</li>
                <li>Select your WhatsApp Business number</li>
                <li>Approve Pax26 to manage AI replies</li>
              </ul>
            </div>

            {/* ✅ REAL META OAUTH */}
            <div onClick={getMetaOauthUrl}>
              <Button className="w-full rounded-xl mb-2 flex items-center justify-center gap-2">
                Continue with Meta
                <ExternalLink size={16} />
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              Pax26 uses Meta’s official WhatsApp Cloud API.
            </p>

            <p onClick={()=>router.push("/ai-automations/whatsapp-connect-info")} className="text-blue-400 text-sm w-25 font-bold underline cursor-pointer">
              How WhatsApp connection works
              </p>
          </CardContent>
        </Card>
      )}

      {/* Webhook Status */}
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-1">Webhook Status</h2>
          <p className="text-sm text-gray-400">
            Incoming WhatsApp messages are delivered to your Pax26 AI webhook.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isWhatsappAiConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {isWhatsappAiConnected
                ? "Webhook active"
                : "Webhook not verified"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
