import { describe, expect, it } from "vitest";
import { formatPrice } from "./price";

describe("formatPrice", () => {
  it("writes yen one way", () => {
    expect(formatPrice("32,000円")).toBe("¥32,000");
    expect(formatPrice("¥32,000")).toBe("¥32,000");
    expect(formatPrice("7400")).toBe("¥7,400");
    expect(formatPrice("24000")).toBe("¥24,000");
    expect(formatPrice("¥2,000,000")).toBe("¥2,000,000");
    expect(formatPrice("733,000円")).toBe("¥733,000");
  });

  it("keeps the printed variants", () => {
    expect(formatPrice("¥16,000 (SS·WP·MB)")).toBe("¥16,000 (SS·WP·MB)");
    expect(formatPrice("¥27,000 (SS·WP·LB) / ¥33,000 (GC·WP·LB)")).toBe("¥27,000 (SS·WP·LB) / ¥33,000 (GC·WP·LB)");
    expect(formatPrice("¥9,000 / ¥10,000")).toBe("¥9,000 / ¥10,000");
  });

  it("leaves other currencies and empties alone", () => {
    expect(formatPrice("$125.00")).toBe("$125.00");
    expect(formatPrice("")).toBeUndefined();
    expect(formatPrice(undefined)).toBeUndefined();
  });
});
