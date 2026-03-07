import { PublicKey } from "@solana/web3.js";
import { IP_CORE_PROGRAM_ID, PDA_SEEDS } from "../constants/programs";
import { utf8Bytes } from "../utils/conversions";

export function deriveDerivativeLinkPda(
  parentIp: PublicKey,
  childIp: PublicKey,
  programId: PublicKey = IP_CORE_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.derivative), parentIp.toBytes(), childIp.toBytes()],
    programId,
  );
}
