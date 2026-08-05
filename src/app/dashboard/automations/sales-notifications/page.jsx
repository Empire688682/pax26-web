import { redirect } from "next/navigation";

// Sales Notifications has been merged into Sales Analytics
export default function Page() {
  redirect("/dashboard/automations/sales");
}
