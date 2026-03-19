import { PublicKey } from "@solana/web3.js";
import type {
  DerivativeLinkFilter,
  EntityFilter,
  IpFilter,
  LicenseFilter,
  LicenseGrantFilter,
  MetadataFilter,
  PaginatedResult,
  PaginationOptions,
} from "../types";
import { toFixedBytes } from "./bytes";

// ---------------------------------------------------------------------------
// Anchor memcmp filter types
// ---------------------------------------------------------------------------

export interface MemcmpFilter {
  memcmp: {
    offset: number;
    bytes: string; // base58-encoded
  };
}

// ---------------------------------------------------------------------------
// Account field byte offsets (8-byte discriminator + cumulative field sizes)
// ---------------------------------------------------------------------------

/** Byte offsets for Entity account fields. */
export const ENTITY_OFFSETS = {
  creator: 8, // pubkey 32
  handle: 40, // [u8;32]
  controller: 72, // pubkey 32
} as const;

/** Byte offsets for IpAccount fields. */
export const IP_OFFSETS = {
  contentHash: 8, // [u8;32]
  registrantEntity: 40, // pubkey 32
  currentOwnerEntity: 72, // pubkey 32
} as const;

/** Byte offsets for DerivativeLink account fields. */
export const DERIVATIVE_LINK_OFFSETS = {
  parentIp: 8, // pubkey 32
  childIp: 40, // pubkey 32
  license: 72, // pubkey 32
} as const;

/** Byte offsets for MetadataAccount fields. */
export const METADATA_OFFSETS = {
  schema: 8, // pubkey 32
  hash: 40, // [u8;32]
  cid: 72, // [u8;96]
  parentType: 168, // enum (1 byte)
  parent: 169, // pubkey 32
} as const;

/** Byte offsets for License account fields. */
export const LICENSE_OFFSETS = {
  originIp: 8, // pubkey 32
  authority: 40, // pubkey 32
} as const;

/** Byte offsets for LicenseGrant account fields. */
export const LICENSE_GRANT_OFFSETS = {
  license: 8, // pubkey 32
  grantee: 40, // pubkey 32
} as const;

// ---------------------------------------------------------------------------
// Filter builders
// ---------------------------------------------------------------------------

function pubkeyFilter(offset: number, key: PublicKey): MemcmpFilter {
  return { memcmp: { offset, bytes: key.toBase58() } };
}

/**
 * Encode arbitrary bytes as a base58 string for memcmp filters.
 *
 * For 32-byte values we wrap them in a PublicKey (which natively encodes
 * to base58) so we don't need an external `bs58` dependency.
 * For other sizes we pad/truncate to 32 bytes and take the base58 prefix.
 * This uses JavaScript's built-in PublicKey, which is always available
 * via `@solana/web3.js`.
 */
function bytesFilter(offset: number, data: Uint8Array): MemcmpFilter {
  if (data.length === 32) {
    return { memcmp: { offset, bytes: new PublicKey(data).toBase58() } };
  }
  // For sub-32-byte values (e.g., 1-byte enum discriminator) we pad to 32
  // and take only the meaningful base58 prefix. However, memcmp compares
  // raw bytes, so we must encode the exact bytes. Use a manual base58
  // encoder for short byte arrays.
  return { memcmp: { offset, bytes: encodeBase58(data) } };
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Minimal base58 encoder for small byte arrays (avoids external dependency). */
function encodeBase58(bytes: Uint8Array): string {
  let num = BigInt(0);
  for (const b of bytes) {
    num = num * BigInt(256) + BigInt(b);
  }
  if (num === BigInt(0)) return BASE58_ALPHABET[0];
  let result = "";
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(58));
    num = num / BigInt(58);
    result = BASE58_ALPHABET[remainder] + result;
  }
  // Preserve leading zeros
  for (const b of bytes) {
    if (b === 0) {
      result = BASE58_ALPHABET[0] + result;
    } else {
      break;
    }
  }
  return result;
}

/** Build memcmp filters for an Entity query. */
export function buildEntityFilters(filter?: EntityFilter): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.creator) {
    filters.push(pubkeyFilter(ENTITY_OFFSETS.creator, filter.creator));
  }
  if (filter.handle) {
    const bytes = Uint8Array.from(toFixedBytes(filter.handle, 32, "handle"));
    filters.push(bytesFilter(ENTITY_OFFSETS.handle, bytes));
  }
  if (filter.controller) {
    filters.push(pubkeyFilter(ENTITY_OFFSETS.controller, filter.controller));
  }
  return filters;
}

/** Build memcmp filters for an IP query. */
export function buildIpFilters(filter?: IpFilter): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.contentHash) {
    filters.push(bytesFilter(IP_OFFSETS.contentHash, filter.contentHash));
  }
  if (filter.registrantEntity) {
    filters.push(
      pubkeyFilter(IP_OFFSETS.registrantEntity, filter.registrantEntity),
    );
  }
  if (filter.currentOwnerEntity) {
    filters.push(
      pubkeyFilter(IP_OFFSETS.currentOwnerEntity, filter.currentOwnerEntity),
    );
  }
  return filters;
}

/** Build memcmp filters for a DerivativeLink query. */
export function buildDerivativeLinkFilters(
  filter?: DerivativeLinkFilter,
): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.parentIp) {
    filters.push(
      pubkeyFilter(DERIVATIVE_LINK_OFFSETS.parentIp, filter.parentIp),
    );
  }
  if (filter.childIp) {
    filters.push(pubkeyFilter(DERIVATIVE_LINK_OFFSETS.childIp, filter.childIp));
  }
  if (filter.license) {
    filters.push(pubkeyFilter(DERIVATIVE_LINK_OFFSETS.license, filter.license));
  }
  return filters;
}

/** Build memcmp filters for a Metadata query. */
export function buildMetadataFilters(filter?: MetadataFilter): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.parentType) {
    // Borsh encodes enums as a single u8 index: Entity = 0, Ip = 1
    const discriminator = filter.parentType === "entity" ? 0 : 1;
    filters.push(
      bytesFilter(
        METADATA_OFFSETS.parentType,
        Uint8Array.from([discriminator]),
      ),
    );
  }
  if (filter.parent) {
    filters.push(pubkeyFilter(METADATA_OFFSETS.parent, filter.parent));
  }
  return filters;
}

/** Build memcmp filters for a License query. */
export function buildLicenseFilters(filter?: LicenseFilter): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.originIp) {
    filters.push(pubkeyFilter(LICENSE_OFFSETS.originIp, filter.originIp));
  }
  if (filter.authority) {
    filters.push(pubkeyFilter(LICENSE_OFFSETS.authority, filter.authority));
  }
  return filters;
}

/** Build memcmp filters for a LicenseGrant query. */
export function buildLicenseGrantFilters(
  filter?: LicenseGrantFilter,
): MemcmpFilter[] {
  if (!filter) return [];
  const filters: MemcmpFilter[] = [];
  if (filter.license) {
    filters.push(pubkeyFilter(LICENSE_GRANT_OFFSETS.license, filter.license));
  }
  if (filter.grantee) {
    filters.push(pubkeyFilter(LICENSE_GRANT_OFFSETS.grantee, filter.grantee));
  }
  return filters;
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

/**
 * Apply client-side pagination to a list of items.
 *
 * Solana's `getProgramAccounts` does not support native pagination,
 * so we fetch all matching accounts and slice the result.
 */
export function paginate<T>(
  items: T[],
  options?: PaginationOptions,
): PaginatedResult<T> {
  const limit = options?.limit ?? DEFAULT_PAGE_SIZE;
  const offset = options?.offset ?? 0;
  const sliced = items.slice(offset, offset + limit);
  return {
    items: sliced,
    hasMore: offset + limit < items.length,
  };
}
