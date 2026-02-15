import { PublicKey } from "@solana/web3.js";
import entityIdl from "../idl/entity.json";
import ipcoreIdl from "../idl/ipcore.json";
import metadataIdl from "../idl/metadata.json";

export const PROGRAM_IDS = {
  devnet: {
    entity: new PublicKey(entityIdl.address),
    metadata: new PublicKey(metadataIdl.address),
    ipcore: new PublicKey(ipcoreIdl.address),
  },
  mainnet: {
    entity: new PublicKey(entityIdl.address),
    metadata: new PublicKey(metadataIdl.address),
    ipcore: new PublicKey(ipcoreIdl.address),
  },
};

export type ProgramIds = {
  entity: PublicKey;
  metadata: PublicKey;
  ipcore: PublicKey;
};
