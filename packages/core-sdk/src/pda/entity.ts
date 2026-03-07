import { PublicKey } from "@solana/web3.js";
import { IP_CORE_PROGRAM_ID, PDA_SEEDS } from "../constants/programs";
import type { StringOrBytes } from "../types";
import { toFixedBytes, utf8Bytes } from "../utils/conversions";

export function deriveEntityPda(
  creator: PublicKey,
  handle: StringOrBytes,
  programId: PublicKey = IP_CORE_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.entity),
      creator.toBytes(),
      Uint8Array.from(toFixedBytes(handle, 32, "handle")),
    ],
    programId,
  );
}
