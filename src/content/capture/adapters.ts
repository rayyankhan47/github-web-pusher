import { buildElementSelector } from "./dom";
import {
  extractFromCodeBlock,
  extractFromContentEditable,
  extractFromSelection,
  extractFromTextarea
} from "./extract";
import { isLikelyCode, toPreview } from "./heuristics";
import type { CandidateAdapter, CandidateSeed } from "./types";

function createSeed(
  element: Element,
  type: CandidateSeed["type"],
  confidence: number,
  metadata: CandidateSeed["metadata"] = {}
): CandidateSeed {
  return {
    type,
    element,
    selector: buildElementSelector(element),
    confidence,
    metadata
  };
}

const textareaAdapter: CandidateAdapter = {
  name: "textarea",
  collect: (documentRef) => {
    const textareas = Array.from(documentRef.querySelectorAll("textarea"));

    return textareas
      .map((textarea) => {
        const extracted = extractFromTextarea(textarea);
        if (!isLikelyCode(extracted.text)) {
          return null;
        }

        const isActive = documentRef.activeElement === textarea;
        return createSeed(textarea, "textarea", isActive ? 0.92 : 0.7, {
          sourceUrl: documentRef.location.href,
          hostname: documentRef.location.hostname,
          title: documentRef.title,
          preview: toPreview(extracted.text)
        });
      })
      .filter((candidate): candidate is CandidateSeed => candidate !== null);
  }
};

const codeBlockAdapter: CandidateAdapter = {
  name: "codeBlock",
  collect: (documentRef) => {
    const codeElements = Array.from(
      documentRef.querySelectorAll("pre code, pre, code")
    ) as Element[];

    return codeElements
      .map((element) => {
        const extracted = extractFromCodeBlock(element);
        if (!isLikelyCode(extracted.text)) {
          return null;
        }

        return createSeed(element, "codeblock", 0.66, {
          sourceUrl: documentRef.location.href,
          hostname: documentRef.location.hostname,
          title: documentRef.title,
          ...(extracted.languageHint ? { languageHint: extracted.languageHint } : {}),
          preview: toPreview(extracted.text)
        });
      })
      .filter((candidate): candidate is CandidateSeed => candidate !== null);
  }
};

const contentEditableAdapter: CandidateAdapter = {
  name: "contentEditable",
  collect: (documentRef) => {
    const editableElements = Array.from(documentRef.querySelectorAll('[contenteditable="true"]'));

    return editableElements
      .map((element) => {
        const extracted = extractFromContentEditable(element);
        if (!isLikelyCode(extracted.text)) {
          return null;
        }

        const isActive = documentRef.activeElement === element;
        return createSeed(element, "contenteditable", isActive ? 0.72 : 0.55, {
          sourceUrl: documentRef.location.href,
          hostname: documentRef.location.hostname,
          title: documentRef.title,
          preview: toPreview(extracted.text)
        });
      })
      .filter((candidate): candidate is CandidateSeed => candidate !== null);
  }
};

const manualSelectionAdapter: CandidateAdapter = {
  name: "manualSelection",
  collect: (documentRef) => {
    const selection = documentRef.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return [];
    }

    const extracted = extractFromSelection(selection);
    if (!isLikelyCode(extracted.text)) {
      return [];
    }

    const range = selection.getRangeAt(0);
    const rootNode = range.commonAncestorContainer;
    const element =
      rootNode.nodeType === Node.ELEMENT_NODE ? (rootNode as Element) : rootNode.parentElement;

    if (!element) {
      return [];
    }

    return [
      createSeed(element, "manual", 0.88, {
        sourceUrl: documentRef.location.href,
        hostname: documentRef.location.hostname,
        title: documentRef.title,
        preview: toPreview(extracted.text)
      })
    ];
  }
};

export const candidateAdapters: CandidateAdapter[] = [
  manualSelectionAdapter,
  textareaAdapter,
  contentEditableAdapter,
  codeBlockAdapter
];
