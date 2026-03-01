import type { Candidate } from "../../shared/models";
import { buildElementSelector, isVisibleElement, toSerializableRect } from "./dom";
import type { CandidateAdapter, CandidateSeed } from "./types";

interface DiscoveryOptions {
  maxCandidates?: number;
}

const DEFAULT_MAX_CANDIDATES = 20;

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function isOverlapping(a: DOMRect, b: DOMRect): boolean {
  return !(
    a.right < b.left ||
    b.right < a.left ||
    a.bottom < b.top ||
    b.bottom < a.top
  );
}

function compareSeedsByPriority(a: CandidateSeed, b: CandidateSeed): number {
  return b.confidence - a.confidence;
}

function collectRawCandidates(documentRef: Document, adapters: CandidateAdapter[]): CandidateSeed[] {
  return adapters.flatMap((adapter) => {
    try {
      return adapter.collect(documentRef);
    } catch {
      return [];
    }
  });
}

function dedupeCandidates(raw: CandidateSeed[]): CandidateSeed[] {
  const sorted = [...raw].sort(compareSeedsByPriority);
  const deduped: CandidateSeed[] = [];

  for (const candidate of sorted) {
    if (!isVisibleElement(candidate.element)) {
      continue;
    }

    const rect = candidate.element.getBoundingClientRect();
    const isDuplicate = deduped.some((existing) => {
      if (existing.selector === candidate.selector) {
        return true;
      }

      if (existing.element === candidate.element) {
        return true;
      }

      return isOverlapping(existing.element.getBoundingClientRect(), rect);
    });

    if (!isDuplicate) {
      deduped.push(candidate);
    }
  }

  return deduped;
}

export function discoverCandidates(
  documentRef: Document,
  adapters: CandidateAdapter[],
  options: DiscoveryOptions = {}
): Candidate[] {
  const maxCandidates = options.maxCandidates ?? DEFAULT_MAX_CANDIDATES;
  const raw = collectRawCandidates(documentRef, adapters);
  const deduped = dedupeCandidates(raw);

  return deduped
    .sort(compareSeedsByPriority)
    .slice(0, maxCandidates)
    .map((seed) => {
      const selector = seed.selector || buildElementSelector(seed.element);

      return {
        id: crypto.randomUUID(),
        type: seed.type,
        selector,
        bounds: toSerializableRect(seed.element.getBoundingClientRect()),
        confidence: clampConfidence(seed.confidence),
        metadata: seed.metadata ?? {}
      };
    });
}

export function pickBestCandidate(candidates: Candidate[]): Candidate | null {
  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((a, b) => b.confidence - a.confidence)[0] ?? null;
}
