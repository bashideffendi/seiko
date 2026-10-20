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
  return `¥${group(amount.replace(/,/g, ""))}`;
}

export function formatPrice(raw: string | null | undefined): string | undefined {
  const s = raw?.trim();
  if (!s) return undefined;
  // A bare number is a JDM price list without a symbol.
  if (/^\d[\d,]*$/.test(s)) return yen(s);
  return s
    .replace(/(\d[\d,]*)\s*円/g, (_, n: string) => yen(n))
    .replace(/[¥￥]\s*(\d[\d,]*)/g, (_, n: string) => yen(n));
}
