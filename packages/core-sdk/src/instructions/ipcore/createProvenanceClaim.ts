import { Program } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { deriveIPAssetPda, deriveProvenanceClaimPda } from "../../pda";

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
