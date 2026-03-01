import type { SerializableRect } from "../../shared/models";

export function toSerializableRect(rect: DOMRect): SerializableRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}

export function isVisibleElement(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

/**
 * Creates a stable best-effort selector for diagnostics and future re-queries.
 */
export function buildElementSelector(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && parts.length < 5) {
    const tag = current.tagName.toLowerCase();

    if (current.id) {
      parts.unshift(`${tag}#${current.id}`);
      break;
    }

    const className = current.className
      .toString()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(".");

    parts.unshift(className ? `${tag}.${className}` : tag);
    current = current.parentElement;
  }

  return parts.join(" > ");
}
