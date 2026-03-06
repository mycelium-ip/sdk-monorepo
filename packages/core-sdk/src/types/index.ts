import type { AnchorProvider } from "@coral-xyz/anchor";
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export type StringOrBytes = string | Uint8Array | number[];

export interface WalletAdapterLike {
  publicKey: PublicKey | null;
  signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    transactions: T[],
  ): Promise<T[]>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}

export interface MyceliumClientOptions {
  connection: Connection;
  wallet: WalletAdapterLike;
  commitment?: Commitment;
  confirmOptions?: ConfirmOptions;
}

export interface SendTxOptions {
  sendOptions?: SendOptions;
  confirmOptions?: ConfirmOptions;
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
  content: Uint8Array;
  treasuryTokenAccount: PublicKey;
  payerTokenAccount: PublicKey;
  payer?: PublicKey;
}

export interface TransferIpParams {
  ip: PublicKey;
  currentOwnerEntity: PublicKey;
  newOwnerEntity: PublicKey;
}

export interface CreateMetadataSchemaParams {
  id: StringOrBytes;
  version: StringOrBytes;
  data: Uint8Array;
  cid: StringOrBytes;
  creator?: PublicKey;
}

export interface CreateEntityMetadataParams {
  entity: PublicKey;
  schema: PublicKey;
  revision: bigint | number;
  data: Uint8Array;
  cid: StringOrBytes;
  payer?: PublicKey;
}

export interface CreateIpMetadataParams {
  ip: PublicKey;
  ownerEntity: PublicKey;
  schema: PublicKey;
  revision: bigint | number;
  data: Uint8Array;
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
