import { getMonthPayments } from "@/lib/supabase/hub";
import FinanceiroView from "@/components/financeiro/FinanceiroView";

export default async function FinanceiroPage() {
  const payments = await getMonthPayments();
  return <FinanceiroView initialPayments={payments} />;
}
