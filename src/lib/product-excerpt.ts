/** First meaningful line / plain excerpt for meta description (Markdown-aware-light). */
export function productMarkdownExcerpt(markdown: string, maxLen = 170): string {
  const trimmed = markdown.trim();
  if (!trimmed) return "";

  let line =
    trimmed
      .split(/\r?\n/)
      .find((l) => l.replace(/[#*_`\[\]()>-]/g, "").trim().length > 1) ??
    trimmed;

  line = line
    .replace(/^#+\s*/, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

  if (line.length <= maxLen) return line;
  return `${line.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}
