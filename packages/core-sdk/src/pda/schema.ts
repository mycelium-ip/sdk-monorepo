import { METADATA_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";

export const deriveSchemaPda = (
  version: anchor.BN,
): [anchor.web3.PublicKey, number] => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.SCHEMA), version.toArrayLike(Buffer, "le", 8)],
    METADATA_PROGRAM_ID,
  );
};
