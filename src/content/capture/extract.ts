import { detectLanguageFromClassName } from "./heuristics";

export interface ExtractionResult {
  text: string;
  languageHint?: string;
}

function elementText(element: Element): string {
  return (element.textContent ?? "").trim();
}

export function extractFromTextarea(element: HTMLTextAreaElement): ExtractionResult {
  return { text: element.value.trim() };
}

export function extractFromCodeBlock(element: Element): ExtractionResult {
  const nestedCode = element.matches("pre") ? element.querySelector("code") : null;
  const codeElement = nestedCode ?? element;
  const text = elementText(codeElement);
  const languageHint = detectLanguageFromClassName(codeElement.className);

  return {
    text,
    ...(languageHint ? { languageHint } : {})
  };
}

export function extractFromContentEditable(element: Element): ExtractionResult {
  const text = (element as HTMLElement).innerText.trim();
  return { text };
}

export function extractFromSelection(selection: Selection): ExtractionResult {
  return { text: selection.toString().trim() };
}
