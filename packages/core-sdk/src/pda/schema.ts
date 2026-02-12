import { METADATA_PROGRAM_ID, SEEDS } from "../constants";
import * as anchor from "@coral-xyz/anchor";
import {
  encodePaddedAscii,
  MAX_SCHEMA_ID_LEN,
  MAX_VERSION_LEN,
} from "../instructions";

export const deriveSchemaPda = (
  schemaId: string,
  version: string,
): [anchor.web3.PublicKey, number] => {
  const schemaIdResult = encodePaddedAscii(schemaId, MAX_SCHEMA_ID_LEN);
  const versionResult = encodePaddedAscii(version, MAX_VERSION_LEN);
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(SEEDS.SCHEMA),
      Buffer.from(schemaIdResult),
      Buffer.from(versionResult), // u16 LE
    ],
    METADATA_PROGRAM_ID,
  );
};
