/** "Try" buttons on the serial decoder. Every one must decode cleanly (see decode.regression.test.ts). */
export const DECODER_EXAMPLES = [
  { serial: "7N0142", caliber: "6309", note: "Turtle diver" },
  { serial: "9D2210", caliber: "6309", note: "single year" },
  { serial: "6O1234", caliber: "7S26", note: "SKX era" },
  { serial: "510456", caliber: "2E20", note: "ladies’ quartz" },
  { serial: "7D1234", caliber: "7002", note: "contradiction" },
] as const;
