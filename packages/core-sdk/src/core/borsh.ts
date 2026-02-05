import { PublicKey } from "@solana/web3.js";

export function encodeU32(value: number): Buffer {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(value, 0);
  return b;
}

export function encodeU8(value: number): Buffer {
  return Buffer.from([value]);
}

export function encodePubkey(pk: PublicKey): Buffer {
  return pk.toBuffer();
}

export function encodePubkeyVec(pks: PublicKey[]): Buffer {
  return Buffer.concat([encodeU32(pks.length), ...pks.map(encodePubkey)]);
}
