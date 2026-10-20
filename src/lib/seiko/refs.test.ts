import { describe, expect, it } from "vitest";
import { caliberFromRef, parseCaseRef } from "./refs";

describe("parseCaseRef", () => {
  it("reads caliber + case number", () => {
    expect(parseCaseRef("6139-6002")).toMatchObject({ full: "6139-6002", caliber: "6139", caseNumber: "6002" });
    expect(parseCaseRef("7s26-0020")).toMatchObject({ full: "7S26-0020", caliber: "7S26" });
    expect(parseCaseRef("4R36-04Y0")?.caseNumber).toBe("04Y0");
  });

  it("does not take JDM model numbers or family codes for case refs", () => {
    expect(parseCaseRef("6159-010")).toBeNull();
    expect(parseCaseRef("2220-210")).toBeNull();
    expect(parseCaseRef("70AC-040")).toBeNull();
    expect(parseCaseRef("31EL-010")).toBeNull();
    expect(parseCaseRef("45GS-020")).toBeNull();
    expect(parseCaseRef("ZW851")).toBeNull();
  });
});

describe("caliberFromRef", () => {
  it("prefers the explicit field, then the ref", () => {
    expect(caliberFromRef("61GAW-010", "6146")).toBe("6146");
    expect(caliberFromRef("6105-8000")).toBe("6105");
    expect(caliberFromRef("6159-010")).toBe("6159");
    expect(caliberFromRef("2220-210")).toBe("2220");
  });

  it("finds no caliber in family codes", () => {
    expect(caliberFromRef("70AC-040")).toBeNull();
    expect(caliberFromRef("31EL-010")).toBeNull();
    expect(caliberFromRef("88ST-001")).toBeNull();
    expect(caliberFromRef("YP037")).toBeNull();
  });
});
