import { PublicKey } from "@solana/web3.js";
import { IPCORE_PROGRAM_ID, SEEDS } from "../constants";

export function deriveIPAssetPda(
  entity: PublicKey,
  ipId: bigint,
): [PublicKey, number] {
  const ipIdBuf = Buffer.alloc(8);
  ipIdBuf.writeBigUInt64LE(ipId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.IP_ASSET), entity.toBuffer(), ipIdBuf],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveIPRegistryPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.IP_REGISTRY)],
    IPCORE_PROGRAM_ID,
  );
}

export function deriveDerivativeLinkPda(
  parentIpId: bigint,
  childIpId: bigint,
): [PublicKey, number] {
  const parentBuf = Buffer.alloc(8);
  const childBuf = Buffer.alloc(8);

  parentBuf.writeBigUInt64LE(parentIpId);
  childBuf.writeBigUInt64LE(childIpId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.DERIVATIVE_LINK), parentBuf, childBuf],
    IPCORE_PROGRAM_ID,
  );
}
