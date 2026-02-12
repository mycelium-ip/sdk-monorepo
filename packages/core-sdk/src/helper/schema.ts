import { createHash } from "crypto";

export function encodePaddedAscii(input: string, maxLen: number): Uint8Array {
  if (!/^[\x00-\x7F]*$/.test(input)) {
    throw new Error("Non-ASCII characters are not allowed");
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);

  if (bytes.length > maxLen) {
    throw new Error(`Input too long. Max length is ${maxLen}`);
  }

  const padded = new Uint8Array(maxLen);
  padded.set(bytes); // remaining bytes stay 0x00
  return padded;
}

export function sha256(data: string): Uint8Array {
  const hash = createHash("sha256").update(data).digest();
  return new Uint8Array(hash);
}
