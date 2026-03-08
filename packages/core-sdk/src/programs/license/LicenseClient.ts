import type { AnchorProvider } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import { getIdls, getProgramIds } from "../../constants/programs";
import type { MyceliumCluster } from "../../types";
import { GrantModule } from "./grant";
import { LicenseModule } from "./license";

export class LicenseClient {
  readonly provider: AnchorProvider;
  readonly program: Program;
  readonly ipCoreProgramId: PublicKey;

  readonly license: LicenseModule;
  readonly grant: GrantModule;

  constructor(provider: AnchorProvider, cluster: MyceliumCluster = "devnet") {
    const programIds = getProgramIds(cluster);
    const idls = getIdls(cluster);

    this.ipCoreProgramId = programIds.ipCore;
    this.provider = provider;
    this.program = new Program(idls.license, provider);

    this.license = new LicenseModule(this);
    this.grant = new GrantModule(this);
  }
}
