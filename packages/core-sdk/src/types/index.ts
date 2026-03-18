import type { AnchorProvider } from "@coral-xyz/anchor";
import type { Wallet } from "@wallet-standard/base";
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
} from "@solana/web3.js";

export * from "./events";

export type StringOrBytes = string | Uint8Array | number[];

export type MyceliumCluster = "devnet" | "mainnet-beta";

export interface MyceliumClientOptions {
  connection: Connection;
  wallet: Wallet;
  commitment?: Commitment;
  confirmOptions?: ConfirmOptions;
  /** Target Solana cluster. Determines which program IDs are used. @default 'devnet' */
  cluster?: MyceliumCluster;
}

export interface SendTxOptions {
  sendOptions?: SendOptions;
  confirmOptions?: ConfirmOptions;
}

/**
 * Result of a send transaction call, including a strongly-typed parsed event.
 */
export interface TransactionResult<E> {
  /** Transaction signature returned by `sendAndConfirm`. */
  signature: string;
  /** The first Anchor event decoded from the transaction logs. */
  event: E;
}

export interface ModuleContext {
  provider: AnchorProvider;
}

export interface CreateEntityParams {
  handle: StringOrBytes;
  creator?: PublicKey;
}

export interface TransferEntityControlParams {
  entity: PublicKey;
  newController: PublicKey;
  /** Current controller. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateIpParams {
  registrantEntity: PublicKey;
  /**
   * SHA-256 hash of the IP content (32 bytes).
   * Use `sha256Hash()` from this package to compute the hash.
   */
  contentHash: Uint8Array;
  /**
   * Treasury token account to receive registration fee.
   * If omitted, derived from protocol config.
   */
  treasuryTokenAccount?: PublicKey;
  /**
   * Payer's token account for the registration currency.
   * If omitted, derived as the ATA of the payer wallet for the registration currency.
   */
  payerTokenAccount?: PublicKey;
  payer?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

/**
 * Protocol configuration fetched from the on-chain config account.
 */
export interface ProtocolConfig {
  /** The authority allowed to update configuration. */
  authority: PublicKey;
  /** The treasury PDA that receives registration fees. */
  treasury: PublicKey;
  /** The SPL token mint for registration fees. */
  registrationCurrency: PublicKey;
  /** The fee amount required to register an IP. */
  registrationFee: bigint;
  /** PDA bump seed. */
  bump: number;
}

/**
 * On-chain entity account data.
 */
export interface EntityAccount {
  /** The original creator of this entity (immutable). */
  creator: PublicKey;
  /** Unique handle for this entity (fixed 32 bytes). */
  handle: number[];
  /** The single controller public key authorised to act on behalf of this entity. */
  controller: PublicKey;
  /** Current metadata revision number. */
  currentMetadataRevision: bigint;
  /** Unix timestamp when this entity was created. */
  createdAt: bigint;
  /** Unix timestamp when this entity was last updated. */
  updatedAt: bigint;
  /** PDA bump seed. */
  bump: number;
}

export interface TransferIpParams {
  ip: PublicKey;
  currentOwnerEntity: PublicKey;
  newOwnerEntity: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateMetadataSchemaParams {
  id: StringOrBytes;
  version: StringOrBytes;
  /**
   * SHA-256 hash of the schema data (32 bytes).
   * Use `sha256Hash()` from this package to compute the hash.
   */
  dataHash: Uint8Array;
  cid: StringOrBytes;
  creator?: PublicKey;
}

export interface CreateEntityMetadataParams {
  entity: PublicKey;
  schema: PublicKey;
  /**
   * SHA-256 hash of the metadata content (32 bytes).
   * Use `sha256Hash()` from this package to compute the hash.
   */
  dataHash: Uint8Array;
  cid: StringOrBytes;
  payer?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateIpMetadataParams {
  ip: PublicKey;
  ownerEntity: PublicKey;
  schema: PublicKey;
  /**
   * SHA-256 hash of the metadata content (32 bytes).
   * Use `sha256Hash()` from this package to compute the hash.
   */
  dataHash: Uint8Array;
  cid: StringOrBytes;
  payer?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateDerivativeLinkParams {
  parentIp: PublicKey;
  childIp: PublicKey;
  childOwnerEntity: PublicKey;
  licenseGrant: PublicKey;
  license: PublicKey;
  payer?: PublicKey;
  licenseProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface UpdateDerivativeLicenseParams {
  parentIp: PublicKey;
  childIp: PublicKey;
  childOwnerEntity: PublicKey;
  newLicenseGrant: PublicKey;
  newLicense: PublicKey;
  derivativeLink?: PublicKey;
  licenseProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateLicenseParams {
  originIp: PublicKey;
  ownerEntity: PublicKey;
  derivativesAllowed: boolean;
  derivativeCheck?: PublicKey;
  payer?: PublicKey;
  ipCoreProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface UpdateLicenseParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  derivativesAllowed: boolean;
  ipCoreProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface RevokeLicenseParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  rentDestination?: PublicKey;
  ipCoreProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface CreateLicenseGrantParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  granteeEntity: PublicKey;
  expiration: bigint | number;
  payer?: PublicKey;
  ipCoreProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}

export interface RevokeLicenseGrantParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  granteeEntity: PublicKey;
  rentDestination?: PublicKey;
  ipCoreProgramId?: PublicKey;
  /** Entity controller that must sign the transaction. Defaults to the connected wallet. */
  controller?: PublicKey;
}
