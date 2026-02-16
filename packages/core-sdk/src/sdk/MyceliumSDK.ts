import type { MyceliumSDKConfig } from "./MyceliumSDK.types";
import { PROGRAM_IDS, type ProgramIds } from "../programs/programIds";
import { EntityNamespace } from "./namespaces/entity";
import { MetadataNamespace } from "./namespaces/metadata";
import { IpcoreNamespace } from "./namespaces/ipcore";
import { AdminNamespace } from "./namespaces/admin";

export class MyceliumSDK {
  readonly chain: MyceliumSDKConfig["chain"];
  readonly programIds: ProgramIds;

  readonly entity: EntityNamespace;
  readonly metadata: MetadataNamespace;
  readonly ipcore: IpcoreNamespace;
  readonly admin: AdminNamespace;

  constructor(config: MyceliumSDKConfig) {
    this.chain = config.chain;
    this.programIds = PROGRAM_IDS[this.chain];

    this.entity = new EntityNamespace(this.programIds);
    this.metadata = new MetadataNamespace(this.programIds);
    this.ipcore = new IpcoreNamespace(this.programIds);
    this.admin = new AdminNamespace(this.programIds);
  }
}
