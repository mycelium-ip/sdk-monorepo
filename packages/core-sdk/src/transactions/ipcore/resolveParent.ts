import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Transaction, Signer } from "@solana/web3.js";
import { Ipcore } from "../../types/ipcore";
import { buildResolveParentIx } from "../../instructions";

export async function createResolveParentTransaction(params: {
  program: Program<Ipcore>;
  parentIpId: BN;
  derivativeIpId: BN;
  parentIp: anchor.web3.PublicKey;
  derivativeIp: anchor.web3.PublicKey;
  derivativeLink: anchor.web3.PublicKey;
  parentEntityAuthority: anchor.web3.PublicKey;
  signer: Signer;
}): Promise<{ transaction: Transaction }> {
  const {
    program,
    parentIpId,
    derivativeIpId,
    parentIp,
    derivativeIp,
    derivativeLink,
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
    derivativeLink,
    parentEntityAuthority,
    signer,
  });

  // ─────────────────────────────────────────────
  // 2. Create a transaction and add the instruction
  // ─────────────────────────────────────────────
  const transaction = new Transaction().add(instruction);

  return { transaction };
}
