import { PublicKey } from "@solana/web3.js";
import { PDA_SEEDS } from "../constants/programs";
import { utf8Bytes } from "../utils/conversions";

export function deriveLicensePda(
  originIp: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [utf8Bytes(PDA_SEEDS.license), originIp.toBytes()],
    programId,
  );
}

export function deriveLicenseGrantPda(
  license: PublicKey,
  granteeEntity: PublicKey,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      utf8Bytes(PDA_SEEDS.licenseGrant),
      license.toBytes(),
      granteeEntity.toBytes(),
    ],
    programId,
  );
}
