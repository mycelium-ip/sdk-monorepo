import type { AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { PublicKey } from "@solana/web3.js";
import ipCoreIdl from "../../../idl/ip_core.json";
import { IP_CORE_PROGRAM_ID } from "../../constants/programs";
import { DerivativeModule } from "./derivative";
import { EntityModule } from "./entity";
import { IpModule } from "./ip";
import { MetadataModule } from "./metadata";

export class IpCoreClient {
  readonly provider: AnchorProvider;
  readonly program: Program;

  readonly entity: EntityModule;
  readonly ip: IpModule;
  readonly metadata: MetadataModule;
  readonly derivative: DerivativeModule;

  constructor(
    provider: AnchorProvider,
    programId: PublicKey = IP_CORE_PROGRAM_ID,
    idl: Idl = ipCoreIdl as Idl,
  ) {
    this.provider = provider;
    this.program = new Program(
      {
        ...(idl as object),
        address: programId.toBase58(),
      } as Idl,
      provider,
    );

    this.entity = new EntityModule(this);
    this.ip = new IpModule(this);
    this.metadata = new MetadataModule(this);
    this.derivative = new DerivativeModule(this);
  }
}
