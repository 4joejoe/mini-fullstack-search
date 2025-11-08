import { Request, Response } from "express";
import data from "../data.json";

interface FaqItem {
  id: number;
  title: string;
  body: string;
  score?: number;
}

const MAX_RESULTS = 3; // Max number of FAQs result to be returned
const SUMMARY_SENTENCES = 3; // Number of FAQs used to generate a summary

/**
 * counts how many times a keyword appears in the text (word-boundary aware)
 * my first approch was using sperators which was prone to fail if words contains the seperator like U.S, far-fetched
 * this regex method is simple still aware of boundaries of words
 */
function countTermOccurrences(text: string, term: string): number {
  const regex = new RegExp(`\\b${term}\\b`, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * computes relevance score for a single FAQ item based on keyword frequency
 * if a FAQ item's body + title contains the matching word it's scores increases, thus boosting it's rank in search result
 */
function scoreFaq(item: FaqItem, terms: string[]): FaqItem {
  const searchString = (item.title + " " + item.body).toLowerCase();
  const score = terms.reduce(
    (sum, term) => sum + countTermOccurrences(searchString, term),
    0
  );
  return { ...item, score };
}

/**
 * builds a short combined summary from top FAQ bodies (simple string ops)
 * with string manuplation, and content given in FAQ, i came up with simple solution for building summary for a search result
 * it uses body of all FAQs present in a search result to form a summary, since given data is factual information which doesnt require any LLM intervention to make sense
 */
function buildSummary(results: FaqItem[], limit = SUMMARY_SENTENCES): string {
  const allSentences = results
    .flatMap((r) => r.body.split("."))
    .map((s) => s.trim())
    .filter((s, i, arr) => s && arr.indexOf(s) === i);

  return allSentences.slice(0, limit).join(". ") + ".";
}

/**
 * comparator for sorting FAQs by score descending.
 * helper function to compare score of one or more FAQs in result
 * the FAQ with largest score will be first in search result
 */
function compareByScore(a: FaqItem, b: FaqItem): number {
  return (b.score ?? 0) - (a.score ?? 0);
}

export async function search_controller(req: Request, res: Response) {
  const query = String(req.body["query"] || "").trim();
  const normalized = query.normalize("NFKC");
  // allow: letters, numbers, whitespace, and basic punctuation
  const disallowed = /[^\p{L}\p{N}\s.,!?:;'"()\-_/@#&*+%]/gu;
  // remove disallowed chars and collapse whitespace
  const sanitized = normalized
    .replace(disallowed, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    return res.status(400).json({ msg: "No query found" });
  }

  const terms = sanitized.toLowerCase().split(/\s+/);

  // Scoring faq function
  const scoredFaqs = (data as FaqItem[]).map((item) => scoreFaq(item, terms));
  // retriveing relevant faqs with filtering
  const relevantFaqs = scoredFaqs.filter((f) => (f.score ?? 0) > 0);
  // sorting result by top score limted to top 3
  const topResults = relevantFaqs.sort(compareByScore).slice(0, MAX_RESULTS);

  if (topResults.length === 0) {
    return res.status(200).json({
      results: [],
      summary: "",
      sources: [],
      msg: "No match found",
    });
  }

  const summary = buildSummary(topResults);
  const sources = topResults.map((r) => r.id);
  return res.status(200).json({ results: topResults, summary, sources });
}
