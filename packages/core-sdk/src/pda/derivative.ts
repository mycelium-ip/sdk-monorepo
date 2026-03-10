import { PublicKey } from "@solana/web3.js";
import { PDA_SEEDS } from "../constants/programs";
import { utf8Bytes } from "../utils/bytes";

export function deriveDerivativeLinkPda(
  parentIp: PublicKey,
  childIp: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.derivative), parentIp.toBytes(), childIp.toBytes()],
    programId,
  );
}
