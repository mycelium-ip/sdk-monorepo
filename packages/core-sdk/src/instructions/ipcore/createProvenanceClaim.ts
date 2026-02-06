import { Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";

export type CreateProvenanceClaimIx = {
  instruction: TransactionInstruction;
  provenancePda: PublicKey;
};

export async function buildCreateProvenanceClaimInstruction(
  program: Program<Ipcore>,
  params: {
    ipAsset: PublicKey;
    entity: PublicKey;
    payer: PublicKey;

    evidenceHash: Buffer; // <= 32 bytes
    uri: string;

    controllers: PublicKey[];
  },
): Promise<CreateProvenanceClaimIx> {
  const { ipAsset, entity, payer, evidenceHash, uri, controllers } = params;

  // ─────────────────────────────────────────────
  // 1. Derive ProvenanceClaim PDA
  // ─────────────────────────────────────────────
  const [provenancePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("provenance"), ipAsset.toBuffer(), evidenceHash],
    program.programId,
  );

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .createProvenanceClaim(evidenceHash, uri)
    .accounts({
      ipAsset,
      entity,
      payer,
    })
    .remainingAccounts(
      controllers.map((pk) => ({
        pubkey: pk,
        isSigner: true,
        isWritable: false,
      })),
    )
    .instruction();

  return {
    instruction,
    provenancePda,
  };
}
