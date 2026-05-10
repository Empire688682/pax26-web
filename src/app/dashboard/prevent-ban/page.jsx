import PreventBan from "@/components/PreventBan/PreventBan";

export const metadata = {
  title: "How To Prevent WhatsApp Ban – Pax26 Safety Guide",
  description:
    "Learn Pax26's official best practices to keep your WhatsApp number safe while running automation campaigns. 7 proven tips to avoid bans.",
  keywords: [
    "prevent whatsapp ban",
    "whatsapp automation safety",
    "pax26 whatsapp tips",
    "avoid whatsapp ban",
    "whatsapp broadcast safety",
    "whatsapp automation nigeria",
  ],
  alternates: {
    canonical: "https://pax26.com/dashboard/prevent-ban",
  },
  openGraph: {
    title: "How To Prevent WhatsApp Ban – Pax26 Safety Guide",
    description:
      "Pax26's 7 official tips to keep your WhatsApp number safe while running automation and broadcast campaigns.",
    url: "https://pax26.com/dashboard/prevent-ban",
    siteName: "Pax26",
    images: [{ url: "/Pax26_single_logo.png", width: 1200, height: 630, alt: "Pax26 Safety Guide" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prevent WhatsApp Ban – Pax26",
    description: "7 proven tips from Pax26 to protect your WhatsApp number during automation.",
    images: ["/Pax26_single_logo.png"],
  },
};

export default function PreventBanPage() {
  return <PreventBan />;
}
