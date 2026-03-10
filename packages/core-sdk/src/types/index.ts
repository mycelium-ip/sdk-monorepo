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
  additionalControllers?: PublicKey[];
  signatureThreshold?: number;
  creator?: PublicKey;
}

export interface UpdateEntityControllersParams {
  entity: PublicKey;
  newControllers: PublicKey[];
  newThreshold: number;
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

export interface TransferIpParams {
  ip: PublicKey;
  currentOwnerEntity: PublicKey;
  newOwnerEntity: PublicKey;
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
}

export interface CreateDerivativeLinkParams {
  parentIp: PublicKey;
  childIp: PublicKey;
  childOwnerEntity: PublicKey;
  licenseGrant: PublicKey;
  license: PublicKey;
  payer?: PublicKey;
  licenseProgramId?: PublicKey;
}

export interface UpdateDerivativeLicenseParams {
  parentIp: PublicKey;
  childIp: PublicKey;
  childOwnerEntity: PublicKey;
  newLicenseGrant: PublicKey;
  newLicense: PublicKey;
  derivativeLink?: PublicKey;
  licenseProgramId?: PublicKey;
}

export interface CreateLicenseParams {
  originIp: PublicKey;
  ownerEntity: PublicKey;
  derivativesAllowed: boolean;
  derivativeCheck?: PublicKey;
  payer?: PublicKey;
  ipCoreProgramId?: PublicKey;
}

export interface UpdateLicenseParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  derivativesAllowed: boolean;
  ipCoreProgramId?: PublicKey;
}

export interface RevokeLicenseParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  rentDestination?: PublicKey;
  ipCoreProgramId?: PublicKey;
}

export interface CreateLicenseGrantParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  granteeEntity: PublicKey;
  expiration: bigint | number;
  payer?: PublicKey;
  ipCoreProgramId?: PublicKey;
}

export interface RevokeLicenseGrantParams {
  originIp: PublicKey;
  authorityEntity: PublicKey;
  granteeEntity: PublicKey;
  rentDestination?: PublicKey;
  ipCoreProgramId?: PublicKey;
}
