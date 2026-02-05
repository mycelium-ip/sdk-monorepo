import { createHash } from "crypto";

/**
 * Anchor instruction discriminator
 */
export function anchorDiscriminator(name: string): Buffer {
  return createHash("sha256").update(`global:${name}`).digest().subarray(0, 8);
}
