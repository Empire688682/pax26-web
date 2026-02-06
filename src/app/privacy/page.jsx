import { useGlobalContext } from "@/components/Context";
import PrivacyPage from '@/components/PrivacyPage/PrivacyPage'

export const metadata = {
    title: "Privacy Policy | Pax26",
    description:
        "Learn how Pax26 collects, uses, and protects your personal information.",
};

export default function page() {
    return (
        <div suppressHydrationWarning={true}>
            <PrivacyPage />
        </div>
    );
}
