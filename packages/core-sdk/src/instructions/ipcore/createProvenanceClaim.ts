import type { Program } from "@coral-xyz/anchor";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { deriveProvenanceClaimPda } from "../../pda";
import type { Ipcore } from "../../types/ipcore";

export type CreateProvenanceClaimIx = {
  instruction: TransactionInstruction;
  provenancePda: PublicKey;
};

export async function buildCreateProvenanceClaimInstruction(
  program: Program<Ipcore>,
  params: {
    ipAssetPda: PublicKey;
    entity: PublicKey;
    payer: PublicKey;

    evidenceHash: Buffer; // <= 32 bytes
    uri: string;

    controllers: PublicKey[];
  },
): Promise<CreateProvenanceClaimIx> {
  const { ipAssetPda, entity, payer, evidenceHash, uri, controllers } = params;

  const [provenancePda] = deriveProvenanceClaimPda(ipAssetPda, evidenceHash);

  // ─────────────────────────────────────────────
  // 2. Build instruction
  // ─────────────────────────────────────────────
  const instruction = await program.methods
    .createProvenanceClaim(evidenceHash, uri)
    .accounts({
      ipAsset: ipAssetPda,
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
