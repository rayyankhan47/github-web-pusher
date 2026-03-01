import { buildElementSelector } from "./dom";
import type { CandidateAdapter, CandidateSeed } from "./types";

function createSeed(
  element: Element,
  type: CandidateSeed["type"],
  confidence: number
): CandidateSeed {
  return {
    type,
    element,
    selector: buildElementSelector(element),
    confidence
  };
}

/**
 * Minimal adapter used to keep discovery pipeline active before full adapters
 * are implemented in the next substep.
 */
const focusedEditableAdapter: CandidateAdapter = {
  name: "focusedEditable",
  collect: (documentRef) => {
    const activeElement = documentRef.activeElement;
    if (!activeElement) {
      return [];
    }

    if (
      activeElement instanceof HTMLTextAreaElement ||
      activeElement instanceof HTMLInputElement ||
      activeElement.getAttribute("contenteditable") === "true"
    ) {
      return [createSeed(activeElement, "unknown", 0.5)];
    }

    return [];
  }
};

export const candidateAdapters: CandidateAdapter[] = [focusedEditableAdapter];
