const CODE_KEYWORDS = [
  "function",
  "const",
  "let",
  "var",
  "class",
  "return",
  "import",
  "export",
  "def ",
  "print(",
  "if ",
  "else",
  "for ",
  "while ",
  "public ",
  "private ",
  "#include",
  "SELECT ",
  "INSERT ",
  "UPDATE "
];

const LANGUAGE_CLASS_PATTERNS = [/language-([a-z0-9#+-]+)/i, /lang-([a-z0-9#+-]+)/i];

function normalizedText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isLikelyCode(rawText: string): boolean {
  const text = rawText.trim();
  if (text.length < 16) {
    return false;
  }

  const newlineCount = (text.match(/\n/g) ?? []).length;
  const punctuationCount = (text.match(/[{}()[\];.=<>:+\-*/]/g) ?? []).length;
  const hasKeyword = CODE_KEYWORDS.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase()));
  const hasIndentedLine = text.split("\n").some((line) => /^\s{2,}\S/.test(line));
  const looksLikeJson = text.startsWith("{") && text.includes(":") && text.endsWith("}");

  return hasKeyword || hasIndentedLine || newlineCount >= 2 || punctuationCount >= 6 || looksLikeJson;
}

export function toPreview(text: string, maxLength = 120): string {
  const normalized = normalizedText(text);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function detectLanguageFromClassName(className: string): string | undefined {
  for (const pattern of LANGUAGE_CLASS_PATTERNS) {
    const match = className.match(pattern);
    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  }
  return undefined;
}
