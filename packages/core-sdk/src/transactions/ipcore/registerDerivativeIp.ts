import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildRegisterDerivativeIpInstruction } from "../../instructions";

export async function createRegisterDerivativeIpTransaction(params: {
  program: Program<Ipcore>;
  entity: PublicKey;
  entityProgram: PublicKey;
  payer: PublicKey;

  ipId: BN;
  name: string;
  category: number;
  parentRefs: BN[];

  controllers: PublicKey[];
}): Promise<{ transaction: Transaction; ipAssetPda: PublicKey }> {
  const {
    program,
    entity,
    entityProgram,
    payer,
    ipId,
    name,
    category,
    parentRefs,
    controllers,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const { instruction, ipAssetPda } =
    await buildRegisterDerivativeIpInstruction(program, {
      entity,
      entityProgram,
      payer,
      ipId,
      name,
      category,
      parentRefs,
      controllers,
    });

  // ─────────────────────────────────────────────
  // 2. Create transaction and add instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return {
    transaction,
    ipAssetPda,
  };
}
