import { Metadata } from "next";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "Admin Analytics Dashboard | MASTERBooks",
  description: "View aggregated library KPIs, engagement statistics, and real-time audit logs.",
};

export default function AdminPage() {
  return <AnalyticsClient />;
}
