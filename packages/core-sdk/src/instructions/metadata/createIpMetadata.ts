import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Metadata } from "../../types/metadata";

/**
 * Build the instruction for creating IP metadata
 */
export async function buildCreateIpMetadataIx(params: {
  program: Program<Metadata>;
  ipAssetPda: anchor.web3.PublicKey;
  schemaPda: anchor.web3.PublicKey;
  version: BN;
  uri: string;
  contentHash: Buffer;
  payer: anchor.web3.PublicKey;
}): Promise<anchor.web3.TransactionInstruction> {
  const { program, ipAssetPda, schemaPda, version, uri, contentHash, payer } =
    params;

  // Derive the IP metadata PDA
  const [ipMetadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ip_metadata"),
      ipAssetPda.toBuffer(),
      version.toArrayLike(Buffer, "le", 8),
    ],
    program.programId,
  );

  return program.methods
    .createIpMetadata(version, uri, contentHash)
    .accounts({
      ipMetadata: ipMetadataPda,
      ipAsset: ipAssetPda,
      schema: schemaPda,
      payer,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}
