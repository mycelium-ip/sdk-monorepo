import type { PublicKey } from "@solana/web3.js";

// ---------------------------------------------------------------------------
// ip_core program events
// ---------------------------------------------------------------------------

/** Emitted when protocol configuration is initialized. */
export interface ConfigInitialized {
  /** The config PDA. */
  config: PublicKey;
  /** The protocol authority. */
  authority: PublicKey;
  /** The treasury PDA. */
  treasury: PublicKey;
  /** The registration currency mint. */
  registrationCurrency: PublicKey;
  /** The registration fee amount. */
  registrationFee: number;
}

/** Emitted when protocol configuration is updated. */
export interface ConfigUpdated {
  /** The config PDA. */
  config: PublicKey;
  /** The authority who made the change. */
  authority: PublicKey;
  /** New authority (if changed). */
  newAuthority: PublicKey | null;
  /** New treasury (if changed). */
  newTreasury: PublicKey | null;
  /** New registration currency (if changed). */
  newRegistrationCurrency: PublicKey | null;
  /** New registration fee (if changed). */
  newRegistrationFee: number | null;
}

/** Emitted when protocol treasury is initialized. */
export interface TreasuryInitialized {
  /** The treasury PDA. */
  treasury: PublicKey;
  /** The treasury authority. */
  authority: PublicKey;
  /** The protocol config PDA. */
  config: PublicKey;
}

/** Emitted when tokens are withdrawn from treasury. */
export interface TreasuryWithdrawal {
  /** The treasury PDA. */
  treasury: PublicKey;
  /** The authority who made the withdrawal. */
  authority: PublicKey;
  /** The destination token account. */
  destination: PublicKey;
  /** The token mint. */
  mint: PublicKey;
  /** The amount withdrawn. */
  amount: number;
}

/** Emitted when a new entity is created. */
export interface EntityCreated {
  /** The entity PDA. */
  entity: PublicKey;
  /** The entity creator. */
  creator: PublicKey;
  /** The entity handle (32-byte fixed array). */
  handle: number[];
  /** Number of controllers. */
  controllerCount: number;
  /** Required signature threshold. */
  signatureThreshold: number;
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when entity controllers are updated. */
export interface EntityControllersUpdated {
  /** The entity PDA. */
  entity: PublicKey;
  /** The entity (acts as authority). */
  authority: PublicKey;
  /** Previous controller count. */
  oldControllerCount: number;
  /** New controller count. */
  newControllerCount: number;
  /** Previous signature threshold. */
  oldThreshold: number;
  /** New signature threshold. */
  newThreshold: number;
  /** Update timestamp. */
  updatedAt: bigint;
}

/** Emitted when a metadata schema is created. */
export interface MetadataSchemaCreated {
  /** The schema PDA. */
  schema: PublicKey;
  /** The schema ID (32-byte fixed array). */
  schemaId: number[];
  /** The schema version (16-byte fixed array). */
  version: number[];
  /** The schema hash (32-byte fixed array). */
  hash: number[];
  /** The schema CID (96-byte fixed array). */
  cid: number[];
  /** The schema creator. */
  creator: PublicKey;
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when entity metadata is created. */
export interface EntityMetadataCreated {
  /** The metadata PDA. */
  metadata: PublicKey;
  /** The entity this metadata belongs to. */
  entity: PublicKey;
  /** The entity (acts as authority). */
  authority: PublicKey;
  /** The metadata schema. */
  schema: PublicKey;
  /** The metadata revision number. */
  revision: number;
  /** The metadata hash (32-byte fixed array). */
  hash: number[];
  /** The metadata CID (96-byte fixed array). */
  cid: number[];
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when IP metadata is created. */
export interface IpMetadataCreated {
  /** The metadata PDA. */
  metadata: PublicKey;
  /** The IP this metadata belongs to. */
  ip: PublicKey;
  /** The owner entity. */
  ownerEntity: PublicKey;
  /** The metadata schema. */
  schema: PublicKey;
  /** The metadata revision number. */
  revision: number;
  /** The metadata hash (32-byte fixed array). */
  hash: number[];
  /** The metadata CID (96-byte fixed array). */
  cid: number[];
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when a new IP is registered. */
export interface IpCreated {
  /** The IP account PDA. */
  ip: PublicKey;
  /** The content hash (32-byte fixed array). */
  contentHash: number[];
  /** The registrant entity. */
  registrantEntity: PublicKey;
  /** The registration fee paid. */
  registrationFee: number;
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when IP ownership is transferred. */
export interface IpTransferred {
  /** The IP account PDA. */
  ip: PublicKey;
  /** The previous owner entity. */
  fromEntity: PublicKey;
  /** The new owner entity. */
  toEntity: PublicKey;
  /** The authority (from_entity) who authorized the transfer. */
  authority: PublicKey;
}

/** Emitted when a derivative link is created. */
export interface DerivativeLinkCreated {
  /** The derivative link PDA. */
  derivativeLink: PublicKey;
  /** The parent IP. */
  parentIp: PublicKey;
  /** The child IP (derivative). */
  childIp: PublicKey;
  /** The license grant used. */
  licenseGrant: PublicKey;
  /** The child IP owner entity. */
  childOwnerEntity: PublicKey;
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when a derivative link's license is updated. */
export interface DerivativeLicenseUpdated {
  /** The derivative link PDA. */
  derivativeLink: PublicKey;
  /** The child IP. */
  childIp: PublicKey;
  /** The previous license grant. */
  oldLicenseGrant: PublicKey;
  /** The new license grant. */
  newLicenseGrant: PublicKey;
  /** The authority (child owner entity) who authorized the change. */
  authority: PublicKey;
}

/** Union of all ip_core program events. */
export type IpCoreEvent =
  | ConfigInitialized
  | ConfigUpdated
  | TreasuryInitialized
  | TreasuryWithdrawal
  | EntityCreated
  | EntityControllersUpdated
  | MetadataSchemaCreated
  | EntityMetadataCreated
  | IpMetadataCreated
  | IpCreated
  | IpTransferred
  | DerivativeLinkCreated
  | DerivativeLicenseUpdated;

// ---------------------------------------------------------------------------
// license program events
// ---------------------------------------------------------------------------

/** Emitted when a new license is created. */
export interface LicenseCreated {
  /** The license PDA. */
  license: PublicKey;
  /** The origin IP this license is for. */
  originIp: PublicKey;
  /** The authority entity (IP owner). */
  authority: PublicKey;
  /** Whether derivatives are allowed. */
  derivativesAllowed: boolean;
  /** Creation timestamp. */
  createdAt: bigint;
}

/** Emitted when a license is updated. */
export interface LicenseUpdated {
  /** The license PDA. */
  license: PublicKey;
  /** The origin IP this license is for. */
  originIp: PublicKey;
  /** The authority entity (IP owner). */
  authority: PublicKey;
  /** Previous derivatives_allowed value. */
  oldDerivativesAllowed: boolean;
  /** New derivatives_allowed value. */
  newDerivativesAllowed: boolean;
}

/** Emitted when a license is revoked (closed). */
export interface LicenseRevoked {
  /** The license PDA. */
  license: PublicKey;
  /** The origin IP this license was for. */
  originIp: PublicKey;
  /** The authority entity (IP owner). */
  authority: PublicKey;
  /** Destination for rent refund. */
  rentDestination: PublicKey;
}

/** Emitted when a new license grant is created. */
export interface LicenseGrantCreated {
  /** The license grant PDA. */
  licenseGrant: PublicKey;
  /** The license this grant is for. */
  license: PublicKey;
  /** The grantee entity. */
  grantee: PublicKey;
  /** Grant expiration (0 = no expiration). */
  expiration: bigint;
  /** Grant timestamp. */
  grantedAt: bigint;
}

/** Emitted when a license grant is revoked (closed). */
export interface LicenseGrantRevoked {
  /** The license grant PDA. */
  licenseGrant: PublicKey;
  /** The license this grant was for. */
  license: PublicKey;
  /** The grantee entity. */
  grantee: PublicKey;
  /** The authority entity who revoked. */
  authority: PublicKey;
  /** Destination for rent refund. */
  rentDestination: PublicKey;
}

/** Union of all license program events. */
export type LicenseEvent =
  | LicenseCreated
  | LicenseUpdated
  | LicenseRevoked
  | LicenseGrantCreated
  | LicenseGrantRevoked;
