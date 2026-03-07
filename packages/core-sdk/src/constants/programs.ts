import { PublicKey } from "@solana/web3.js";
import ipCoreIdl from "../../idl/ip_core.json";
import licenseIdl from "../../idl/license.json";

type IdlWithAddress = {
  address: string;
};

const fallbackIpCoreProgramId = "3x8zi15UHjdD8CkqbBFX49SvcrDyh9gRfCZhDmnSBAZL";
const fallbackLicenseProgramId = "CG9nDkSt85FM3wbq4NpeQVp9BEyhdnZPRebdEWYy8GYo";

export const IP_CORE_PROGRAM_ID = new PublicKey(
  (ipCoreIdl as IdlWithAddress).address ?? fallbackIpCoreProgramId,
);

export const LICENSE_PROGRAM_ID = new PublicKey(
  (licenseIdl as IdlWithAddress).address ?? fallbackLicenseProgramId,
);

export const PDA_SEEDS = {
  entity: "entity",
  ip: "ip",
  metadata: "metadata",
  entityKind: "entity",
  ipKind: "ip",
  metadataSchema: "metadata_schema",
  config: "config",
  treasury: "treasury",
  derivative: "derivative",
  license: "license",
  licenseGrant: "license_grant",
} as const;
