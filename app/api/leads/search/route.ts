import { type NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadResult {
  place_id: string;
  nome: string;
  endereco: string;
  telefone: string | null;
  site: string | null;
  rating: number | null;
  total_avaliacoes: number | null;
  score: number; // 0-3: quanto maior, mais oportunidade de venda
  score_motivos: string[];
}

interface PlacesTextSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

interface PlaceDetailsResult {
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
}

// ─── Score ────────────────────────────────────────────────────────────────────
// Quanto maior o score, mais deficiências o negócio tem → maior oportunidade.
// Máximo: 3 pontos.

function calcScore(detail: PlaceDetailsResult): { score: number; motivos: string[] } {
  const motivos: string[] = [];

  if (!detail.website) {
    motivos.push("Sem site");
  }

  const semAvaliacao = !detail.rating || detail.rating < 4.0 || (detail.user_ratings_total ?? 0) < 15;
  if (semAvaliacao) {
    motivos.push(
      !detail.rating
        ? "Sem avaliações no Google"
        : detail.rating < 4.0
        ? `Nota baixa (${detail.rating.toFixed(1)})`
        : "Poucas avaliações"
    );
  }

  if (!detail.formatted_phone_number) {
    motivos.push("Sem telefone cadastrado");
  }

  return { score: motivos.length, motivos };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function textSearch(query: string, apiKey: string): Promise<PlacesTextSearchResult[]> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("region", "br");

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places Text Search erro: ${data.status} — ${data.error_message ?? ""}`);
  }

  return (data.results ?? []).slice(0, 10);
}

async function placeDetails(placeId: string, apiKey: string): Promise<PlaceDetailsResult> {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("language", "pt-BR");

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Google Places Details erro: ${data.status}`);
  }

  return data.result;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY não configurada no .env.local" },
      { status: 500 }
    );
  }

  let body: { bairro?: string; segmento?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const bairro = body.bairro?.trim();
  const segmento = body.segmento?.trim();

  if (!bairro || !segmento) {
    return NextResponse.json({ error: "bairro e segmento são obrigatórios" }, { status: 400 });
  }

  try {
    // Busca no Google Maps: "{segmento} em {bairro}, São Paulo, SP"
    const query = `${segmento} ${bairro} São Paulo SP`;
    const places = await textSearch(query, apiKey);

    if (places.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    // Busca detalhes de todos em paralelo
    const detailsResults = await Promise.allSettled(
      places.map((p) => placeDetails(p.place_id, apiKey))
    );

    const leads: LeadResult[] = detailsResults
      .map((result, i) => {
        if (result.status === "rejected") return null;
        const detail = result.value;
        const place = places[i];
        const { score, motivos } = calcScore(detail);

        return {
          place_id: place.place_id,
          nome: detail.name ?? place.name,
          endereco: detail.formatted_address ?? place.formatted_address,
          telefone: detail.formatted_phone_number ?? null,
          site: detail.website ?? null,
          rating: detail.rating ?? place.rating ?? null,
          total_avaliacoes: detail.user_ratings_total ?? place.user_ratings_total ?? null,
          score,
          score_motivos: motivos,
        } satisfies LeadResult;
      })
      .filter((l): l is LeadResult => l !== null)
      // Ordena do mais quente (maior score) para o mais frio
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({ leads });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
