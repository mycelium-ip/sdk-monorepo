import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import type { ProgramIds } from "../../programs/programIds";
import type { Ipcore } from "../../types/ipcore";
import { BN } from "@coral-xyz/anchor";
import {
  addDerivativeLinkTransaction,
  addIpAssetTransaction,
  createDerivativeLinkTransaction,
  createProvenanceClaimTransaction,
  createInitIpRegistryTransaction,
  createInitializeRegistryConfigTransaction,
  createInitializeRegistryConfigTreasuryTransaction,
  createInitModuleConfigTransaction,
  createRegisterIpAssetTransaction,
  createResolveParentTransaction,
  createUpdateRegistryConfigTransaction,
  initIpCounterTransaction,
} from "../../transactions/ipcore";

export class IpcoreNamespace {
  private readonly programIds: ProgramIds;

  constructor(programIds: ProgramIds) {
    this.programIds = programIds;
  }

  async generateAddDerivativeLinkTransaction(params: {
    program: Program<Ipcore>;
    derivativeLink: PublicKey;
  }): Promise<{ transaction: Transaction }> {
    return addDerivativeLinkTransaction(params);
  }

  async generateAddIpAssetTransaction(params: {
    program: Program<Ipcore>;
    registryPda: PublicKey;
    ipAsset: PublicKey;
    authority: PublicKey;
  }): Promise<{ transaction: Transaction }> {
    return addIpAssetTransaction(params);
  }

  async generateCreateDerivativeLinkTransaction(params: {
    program: Program<Ipcore>;
    parentIpId: BN;
    childIpId: BN;
    authority: PublicKey;
    entityPda: PublicKey;
  }): Promise<{ transaction: Transaction; derivativeLinkPda: PublicKey }> {
    return createDerivativeLinkTransaction(params);
  }

  async generateCreateProvenanceClaimTransaction(params: {
    program: Program<Ipcore>;
    ipAssetPda: PublicKey;
    entity: PublicKey;
    payer: PublicKey;
    evidenceHash: Buffer;
    uri: string;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction; provenancePda: PublicKey }> {
    return createProvenanceClaimTransaction(params);
  }

  async generateInitIpRegistryTransaction(params: {
    program: Program<Ipcore>;
    payer: PublicKey;
  }): Promise<{ transaction: Transaction; registryPda: PublicKey }> {
    return createInitIpRegistryTransaction(params);
  }

  async generateInitializeRegistryConfigTransaction(params: {
    program: Program<Ipcore>;
    authority: PublicKey;
    feeLamports: BN;
  }): Promise<{ transaction: Transaction }> {
    return createInitializeRegistryConfigTransaction(params);
  }

  async generateInitializeRegistryConfigTreasuryTransaction(params: {
    program: Program<Ipcore>;
    registryConfig: PublicKey;
    authority: PublicKey;
  }): Promise<{ transaction: Transaction }> {
    return createInitializeRegistryConfigTreasuryTransaction(params);
  }

  async generateInitModuleConfigTransaction(params: {
    program: Program<Ipcore>;
    ipAsset: PublicKey;
    payer: PublicKey;
  }): Promise<{ transaction: Transaction; moduleConfigPda: PublicKey }> {
    return createInitModuleConfigTransaction(params);
  }

  async generateRegisterIpAssetTransaction(params: {
    program: Program<Ipcore>;
    metadataProgram: Program<import("../../types").Metadata>;
    payer: PublicKey;
    entityIndex: number;
    registrationFee: number;
    metadataUri: string;
    controllers: PublicKey[];
  }): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
    return createRegisterIpAssetTransaction(params);
  }

  async generateResolveParentTransaction(params: {
    program: Program<Ipcore>;
    parentIpId: BN;
    derivativeIpId: BN;
    parentIp: PublicKey;
    derivativeIp: PublicKey;
    parentEntityAuthority: PublicKey;
    signer: import("@solana/web3.js").Signer;
  }): Promise<{ transaction: Transaction }> {
    return createResolveParentTransaction(params);
  }

  async generateUpdateRegistryConfigTransaction(params: {
    program: Program<Ipcore>;
    registryConfig: PublicKey;
    authority: PublicKey;
    newFeeLamports: BN;
  }): Promise<{ transaction: Transaction }> {
    return createUpdateRegistryConfigTransaction(params);
  }

  async generateInitIpCounterTransaction(params: {
    program: Program<Ipcore>;
    payer: PublicKey;
  }): Promise<{ transaction: Transaction }> {
    return initIpCounterTransaction(params);
  }
}
