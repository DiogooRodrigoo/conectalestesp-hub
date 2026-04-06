export const dynamic = "force-dynamic";

import { getClients } from "@/lib/supabase/hub";
import ClientesView from "@/components/clientes/ClientesView";

export default async function ClientesPage() {
  const clients = await getClients();
  return <ClientesView clients={clients} />;
}
