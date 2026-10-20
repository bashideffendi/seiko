/**
 * Catalogue list prices, written one way.
 *
 * Extraction kept prices as printed, so the same yen amount arrives as "32,000円", "¥32,000"
 * or a bare "7400" (the JDM price lists that print no symbol at all). Every catalogue that
 * prints prices so far is a Japanese domestic edition, so a bare number is yen. Anything
 * carrying another symbol ($, £) is left as printed apart from digit grouping.
 */

const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function yen(amount: string) {
  return `¥${group(amount.replace(/[,.]/g, ""))}`;
}

// A yen amount: plain digits, or groups of three split by commas or (as some JDM lists print) dots.
const AMOUNT = String.raw`\d{1,3}(?:[,.]\d{3})+|\d+`;
const BEFORE_EN = new RegExp(String.raw`(${AMOUNT})\s*円`, "g");
const AFTER_YEN = new RegExp(String.raw`[¥￥]\s*(${AMOUNT})`, "g");

export function formatPrice(raw: string | null | undefined): string | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  // A bare number is a JDM price list without a symbol.
  if (new RegExp(`^(?:${AMOUNT})$`).test(s)) return yen(s);
  return s.replace(BEFORE_EN, (_, n: string) => yen(n)).replace(AFTER_YEN, (_, n: string) => yen(n));
}
