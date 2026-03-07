import { PublicKey } from "@solana/web3.js";
import { IP_CORE_PROGRAM_ID, PDA_SEEDS } from "../constants/programs";
import { utf8Bytes } from "../utils/conversions";

export function deriveIpPda(
  registrantEntity: PublicKey,
  contentHash: Uint8Array,
  programId: PublicKey = IP_CORE_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.ip),
      registrantEntity.toBytes(),
      contentHash.length === 32 ? contentHash : contentHash.slice(0, 32),
    ],
    programId,
  );
}
