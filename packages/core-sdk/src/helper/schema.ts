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

export function decodePaddedAscii(bytes: Uint8Array): string {
  // Remove trailing 0x00
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) {
    end--;
  }

  const trimmed = bytes.slice(0, end);

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(trimmed);
}
