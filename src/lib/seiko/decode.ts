import type { DecodeOptions, DecodeResult } from "./types";
import { CALIBERS } from "@/data/calibers";
import { decodeSerial } from "./decodeCore";

// Server/test entry point: the pure decoder with the full bundled caliber dataset as default.
// Client components should import `decodeSerial` from ./decodeCore and pass a slim dataset,
// so the caliber JSON (notes, sources…) stays out of the browser bundle.

export { SCHEME_START_YEAR, normalizeSerial, candidateYears } from "./decodeCore";

export function decodeSeiko(serial: string, opts: DecodeOptions = {}): DecodeResult {
  const { caliberData, ...rest } = opts;
  return decodeSerial(serial, caliberData ?? CALIBERS, rest);
}
