// Browser equivalents for the two crypto helpers used by the sample curriculum.
export function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function randomInt(max: number): number {
  if (!Number.isSafeInteger(max) || max <= 0 || max > 2 ** 32)
    throw new RangeError("Expected a positive integer no greater than 2^32");
  const limit = Math.floor(2 ** 32 / max) * max;
  const bytes = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(bytes);
  } while (bytes[0] >= limit);
  return bytes[0] % max;
}
