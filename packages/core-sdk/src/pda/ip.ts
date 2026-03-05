import { PublicKey } from "@solana/web3.js";
import { IP_CORE_PROGRAM_ID, PDA_SEEDS } from "../constants/programs";
import type { StringOrBytes } from "../types";
import { toFixedBytes, utf8Bytes } from "../utils/conversions";

export function deriveIpPda(
  registrantEntity: PublicKey,
  contentHash: StringOrBytes,
  programId: PublicKey = IP_CORE_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.ip),
      registrantEntity.toBytes(),
      Uint8Array.from(toFixedBytes(contentHash, 32, "contentHash")),
    ],
    programId,
  );
}
