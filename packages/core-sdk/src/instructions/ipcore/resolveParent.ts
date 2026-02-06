import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Ipcore } from "../../types/ipcore";

export async function buildResolveParentIx(params: {
  parentIpId: BN;
  derivativeIpId: BN;
  program: Program<Ipcore>;
  parentIp: anchor.web3.PublicKey;
  derivativeIp: anchor.web3.PublicKey;
  parentEntityAuthority: anchor.web3.PublicKey;
  signer: anchor.web3.Signer; // the controller signing the tx
}): Promise<anchor.web3.TransactionInstruction> {
  const {
    parentIpId,
    derivativeIpId,
    program,
    parentIp,
    derivativeIp,
    parentEntityAuthority,
    signer,
  } = params;

  return await program.methods
    .resolveParent(parentIpId, derivativeIpId)
    .accounts({
      parentIp,
      derivativeIp,
      parentEntityAuthority,
    })
    .signers([signer])
    .instruction();
}
