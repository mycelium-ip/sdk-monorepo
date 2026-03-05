import type { AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import licenseIdl from "../../../idl/license.json";
import { LICENSE_PROGRAM_ID } from "../../constants/programs";
import { GrantModule } from "./grant";
import { LicenseModule } from "./license";

export class LicenseClient {
  readonly provider: AnchorProvider;
  readonly program: Program;

  readonly license: LicenseModule;
  readonly grant: GrantModule;

  constructor(
    provider: AnchorProvider,
    programId: PublicKey = LICENSE_PROGRAM_ID,
    idl: Idl = licenseIdl as Idl,
  ) {
    this.provider = provider;
    this.program = new Program(
      {
        ...(idl as object),
        address: programId.toBase58(),
      } as Idl,
      provider,
    );

    this.license = new LicenseModule(this);
    this.grant = new GrantModule(this);
  }
}
