import { notFound } from "next/navigation";
import { getClientById } from "@/lib/supabase/hub";
import ClienteDetailView from "@/components/clientes/ClienteDetailView";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();
  return <ClienteDetailView client={client} />;
}
