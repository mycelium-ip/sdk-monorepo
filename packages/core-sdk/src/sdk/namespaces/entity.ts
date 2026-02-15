import type { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { ProgramIds } from "../../programs/programIds";
import type { Entity } from "../../types/entity";
import type { Metadata } from "../../types/metadata";
import {
  assertControllerThresholdTransaction,
  initEntityCounterTransaction,
  initEntityTreasuryTransaction,
  updateControllersTransaction,
  createEntityTransaction,
} from "../../transactions/entity";

export class EntityNamespace {
  private readonly programIds: ProgramIds;

  constructor(programIds: ProgramIds) {
    this.programIds = programIds;
  }

  async generateRegisterTransaction(params: {
    program: Program<Entity>;
    metadataProgram: Program<Metadata>;
    controllers: anchor.web3.PublicKey[];
    threshold: number;
    metadataUri: string;
    payer: anchor.web3.PublicKey;
  }): Promise<{ transaction: anchor.web3.Transaction }> {
    return createEntityTransaction(params);
  }

  async generateInitCounterTransaction(params: {
    program: Program<Entity>;
    payer: anchor.web3.PublicKey;
  }): Promise<{ transaction: anchor.web3.Transaction }> {
    return initEntityCounterTransaction(params);
  }

  async generateInitTreasuryTransaction(params: {
    program: Program<Entity>;
    entityPda: anchor.web3.PublicKey;
    payer: anchor.web3.PublicKey;
    controllers: anchor.web3.PublicKey[];
  }): Promise<{ transaction: anchor.web3.Transaction }> {
    return initEntityTreasuryTransaction(params);
  }

  async generateUpdateControllersTransaction(params: {
    program: Program<Entity>;
    owner: anchor.web3.PublicKey;
    entityIndex: anchor.BN;
    newControllers: anchor.web3.PublicKey[];
    newThreshold: number;
    controllers: anchor.web3.PublicKey[];
  }): Promise<{
    transaction: anchor.web3.Transaction;
    entityPda: anchor.web3.PublicKey;
  }> {
    return updateControllersTransaction(params);
  }

  async generateAssertControllerThresholdTransaction(params: {
    program: Program<Entity>;
    owner: anchor.web3.PublicKey;
    entityIndex: anchor.BN;
    controllers: anchor.web3.PublicKey[];
  }): Promise<{
    transaction: anchor.web3.Transaction;
    entityPda: anchor.web3.PublicKey;
  }> {
    return assertControllerThresholdTransaction(params);
  }
}
