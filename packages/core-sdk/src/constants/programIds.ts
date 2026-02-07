import { PublicKey } from "@solana/web3.js";
import entityIdl from "../idl/entity.json";
import ipcoreIdl from "../idl/ipcore.json";
import metadataIdl from "../idl/metadata.json";

const ENTITY_PROGRAM_ID = new PublicKey(entityIdl.address);

const IPCORE_PROGRAM_ID = new PublicKey(ipcoreIdl.address);

const METADATA_PROGRAM_ID = new PublicKey(metadataIdl.address);

export { ENTITY_PROGRAM_ID, IPCORE_PROGRAM_ID, METADATA_PROGRAM_ID };
