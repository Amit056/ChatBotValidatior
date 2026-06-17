// src/utils/textUtils.ts
export function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")   // remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 2);
}