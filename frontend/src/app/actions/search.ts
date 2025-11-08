"use server";

import type { SearchState } from "../../types/search";

export default async function searchAction(
  _prevState: SearchState,
  formData: FormData
): Promise<SearchState> {
  const raw = String(formData.get("query") ?? "");
  const normalized = raw.normalize("NFKC");

  // Allow: letters, numbers, whitespace, and basic punctuation
  const disallowed = /[^\p{L}\p{N}\s.,!?:;'"()\-_/@#&*+%]/gu;

  // Remove disallowed chars and collapse whitespace
  const sanitized = normalized
    .replace(disallowed, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized)
    return {
      results: [],
      summary: "",
      sources: [],
      msg: "Invalid or empty query",
    };

  const hadRemoval = sanitized !== raw.trim();

  try {
    const response = await fetch("http://localhost:8000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ query: sanitized }),
    });

    if (!response.ok) {
      return {
        results: [],
        summary: "",
        sources: [],
        msg: `Status ${response.status}`,
      };
    }

    const json = await response.json();
    const {
      results = [],
      summary = "",
      sources = [],
      msg = "",
    } = json as Partial<SearchState>;

    const clientMsg = hadRemoval
      ? "Some characters were removed from the query."
      : "";
    const finalMsg = [clientMsg, msg].filter(Boolean).join(" ");

    return { results, summary, sources, msg: finalMsg };
  } catch {
    return {
      results: [],
      summary: "",
      sources: [],
      msg: "Request failed",
    };
  }
}
