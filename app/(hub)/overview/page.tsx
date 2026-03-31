import { getHubMetrics, getUpcomingPayments } from "@/lib/supabase/hub";
import OverviewView from "@/components/overview/OverviewView";

export default async function OverviewPage() {
  const [metrics, payments] = await Promise.all([
    getHubMetrics(),
    getUpcomingPayments(8),
  ]);

  return <OverviewView metrics={metrics} payments={payments} />;
}
