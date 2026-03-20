import { PublicKey } from "@solana/web3.js";
import { PDA_SEEDS } from "../constants/programs";
import { u64SeedBytes, utf8Bytes } from "../utils/bytes";

export function deriveEntityPda(
  creator: PublicKey,
  index: bigint | number,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.entity), creator.toBytes(), u64SeedBytes(index)],
    programId,
  );
}

export function deriveCreatorEntityCounterPda(
  creator: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.entityCounter), creator.toBytes()],
    programId,
  );
}
