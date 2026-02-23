import type { Program } from "@coral-xyz/anchor";
import { type PublicKey, Transaction } from "@solana/web3.js";
import type { ProgramIds } from "../../programs/programIds";
import type { Entity } from "../../types/entity";
import type { Metadata } from "../../types/metadata";
import type { Ipcore } from "../../types/ipcore";
import { initAdminInstructions } from "../../transactions/admin/adminTransaction";

export class AdminNamespace {
  private readonly programIds: ProgramIds;

  constructor(programIds: ProgramIds) {
    this.programIds = programIds;
  }

  async generateInitAdminTransaction(params: {
    schemaCid: string;
    entityProgram: Program<Entity>;
    metadataProgram: Program<Metadata>;
    ipcoreProgram: Program<Ipcore>;
    payer: PublicKey;
    registrationFee: number;
    schemaVersion: string;
    schemaJson: string;
    schemaId: string;
  }): Promise<{ transaction: Transaction }> {
    return initAdminInstructions(params);
  }
}
