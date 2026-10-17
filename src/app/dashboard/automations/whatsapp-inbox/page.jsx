import { Suspense } from "react";
import WhatsAppInbox from '@/components/WhatsapInbox/WhatsappInbox';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WhatsAppInbox />
    </Suspense>
  );
}

