import type { Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import devnetIpCoreIdl from "../../idl/devnet/ip_core.json";
import devnetLicenseIdl from "../../idl/devnet/license.json";
// TODO: replace with actual mainnet-beta addresses once the programs are deployed.
import mainnetBetaIpCoreIdl from "../../idl/mainnet-beta/ip_core.json";
import mainnetBetaLicenseIdl from "../../idl/mainnet-beta/license.json";
import type { MyceliumCluster } from "../types";

type IdlWithAddress = {
  address: string;
};

const fallbackIpCoreProgramId = "47gfhX3eMBKzxHejX5n8HXxWSg8qi6DcbHDRRRXSoUUw";
const fallbackLicenseProgramId = "BWX7AGub4tSjEq45cy1xsXpsPcAmSDv2djMiPnkR7Sj2";

/**
 * Per-cluster program ID map.
 * Use `getProgramIds(cluster)` for ergonomic access.
 */
export const PROGRAM_IDS: Record<
  MyceliumCluster,
  { ipCore: PublicKey; license: PublicKey }
> = {
  devnet: {
    ipCore: new PublicKey(
      (devnetIpCoreIdl as IdlWithAddress).address ?? fallbackIpCoreProgramId,
    ),
    license: new PublicKey(
      (devnetLicenseIdl as IdlWithAddress).address ?? fallbackLicenseProgramId,
    ),
  },
  "mainnet-beta": {
    ipCore: new PublicKey(
      (mainnetBetaIpCoreIdl as IdlWithAddress).address ??
        fallbackIpCoreProgramId,
    ),
    license: new PublicKey(
      (mainnetBetaLicenseIdl as IdlWithAddress).address ??
        fallbackLicenseProgramId,
    ),
  },
};

/**
 * Returns the program IDs for the given cluster.
 */
export function getProgramIds(cluster: MyceliumCluster): {
  ipCore: PublicKey;
  license: PublicKey;
} {
  return PROGRAM_IDS[cluster];
}

const CLUSTER_IDLS: Record<MyceliumCluster, { ipCore: Idl; license: Idl }> = {
  devnet: {
    ipCore: devnetIpCoreIdl as Idl,
    license: devnetLicenseIdl as Idl,
  },
  "mainnet-beta": {
    ipCore: mainnetBetaIpCoreIdl as Idl,
    license: mainnetBetaLicenseIdl as Idl,
  },
};

/**
 * Returns the IDLs for the given cluster.
 */
export function getIdls(cluster: MyceliumCluster): {
  ipCore: Idl;
  license: Idl;
} {
  return CLUSTER_IDLS[cluster];
}

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
