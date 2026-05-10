export const PUBLIC_NOTICE_FALLBACK_TITLE = "Latest student updates will appear here.";

const TEST_NOTICE_PATTERNS = [
  /^(hello\s+testing|testing|test)[\s.!-]*$/i,
  /\bhello\s+testing\b/i,
  /\btest\s+(notice|data|title|post|update)\b/i,
  /\btesting\s+(notice|data|title|post|update)\b/i,
  /\bdummy\b/i,
  /\bsample\b/i,
  /\blorem\s+ipsum\b/i,
  /\basdf\b/i,
  /\bqwerty\b/i,
  /\brandom\b/i,
];

function normalizeNoticeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function hasReadableShape(text: string) {
  const letters = text.match(/\p{L}/gu)?.length || 0;
  const words = text.match(/\p{L}{3,}/gu) || [];
  const symbolCount = text.match(/[^\p{L}\p{N}\s.,:;!?&()/'-]/gu)?.length || 0;
  const longLowVowelTokens = words.filter((word) => {
    const latinWord = word.toLocaleLowerCase("en-US");
    const vowelCount = latinWord.match(/[aeiou]/g)?.length || 0;
    return /^[a-z]+$/.test(latinWord) && latinWord.length >= 8 && vowelCount <= 1;
  });

  if (letters < 4) return false;
  if (words.length === 0) return false;
  if (symbolCount > 0 && symbolCount / Math.max(text.length, 1) > 0.18) return false;
  if (/(\p{L})\1{4,}/iu.test(text)) return false;
  if (longLowVowelTokens.length > 0 && words.length <= 2) return false;

  return true;
}

export function isCleanPublicNoticeTitle(title: unknown) {
  const text = normalizeNoticeText(title);

  if (!text) return false;
  if (TEST_NOTICE_PATTERNS.some((pattern) => pattern.test(text))) return false;

  return hasReadableShape(text);
}

export function getCleanPublicNotices<T extends { title: unknown }>(notices: T[], limit = 6) {
  return notices.filter((notice) => isCleanPublicNoticeTitle(notice.title)).slice(0, limit);
}
