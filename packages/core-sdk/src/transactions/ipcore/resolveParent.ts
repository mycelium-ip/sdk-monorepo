import type * as anchor from "@coral-xyz/anchor";
import type { BN, Program } from "@coral-xyz/anchor";
import { type Signer, Transaction } from "@solana/web3.js";
import { buildResolveParentIx } from "../../instructions";
import type { Ipcore } from "../../types/ipcore";

export async function createResolveParentTransaction(params: {
  program: Program<Ipcore>;
  parentIpId: BN;
  derivativeIpId: BN;
  parentIp: anchor.web3.PublicKey;
  derivativeIp: anchor.web3.PublicKey;
  parentEntityAuthority: anchor.web3.PublicKey;
  signer: Signer;
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    parentIpId,
    derivativeIpId,
    parentIp,
    derivativeIp,
    parentEntityAuthority,
    signer,
  } = params;

  // ─────────────────────────────────────────────
  // 1. Build the instruction
  // ─────────────────────────────────────────────
  const instruction = await buildResolveParentIx({
    program,
    parentIpId,
    derivativeIpId,
    parentIp,
    derivativeIp,
    parentEntityAuthority,
    signer,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
