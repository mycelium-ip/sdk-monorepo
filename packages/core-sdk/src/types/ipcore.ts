/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ipcore.json`.
 */
export type Ipcore = {
  address: "GQkjkFSyMA2f1TouaHDW2aYWnrA4YUVgEhHFZZQyJDj7";
  metadata: {
    name: "ipcore";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "activateIp";
      discriminator: [92, 29, 187, 41, 141, 42, 18, 82];
      accounts: [
        {
          name: "entity";
        },
        {
          name: "ipAsset";
          writable: true;
        },
        {
          name: "entityProgram";
          address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
        },
      ];
      args: [];
    },
    {
      name: "addDerivativeLink";
      discriminator: [151, 62, 2, 15, 129, 24, 57, 135];
      accounts: [
        {
          name: "registry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 114, 101, 103, 105, 115, 116, 114, 121];
              },
            ];
          };
        },
        {
          name: "derivativeLink";
          docs: ["The derivative link account"];
        },
      ];
      args: [];
    },
    {
      name: "addIpAsset";
      discriminator: [36, 207, 34, 83, 222, 161, 86, 202];
      accounts: [
        {
          name: "registry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 114, 101, 103, 105, 115, 116, 114, 121];
              },
            ];
          };
        },
        {
          name: "ipAsset";
          docs: ["The IPAsset being added"];
        },
      ];
      args: [];
    },
    {
      name: "changeEntity";
      discriminator: [151, 240, 229, 233, 220, 20, 103, 243];
      accounts: [
        {
          name: "newEntity";
        },
        {
          name: "previousEntity";
        },
        {
          name: "ipAsset";
          writable: true;
        },
        {
          name: "entityProgram";
          address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
        },
      ];
      args: [];
    },
    {
      name: "createDerivativeLink";
      discriminator: [145, 37, 194, 127, 5, 135, 125, 122];
      accounts: [
        {
          name: "derivativeLink";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  100,
                  101,
                  114,
                  105,
                  118,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  108,
                  105,
                  110,
                  107,
                ];
              },
              {
                kind: "arg";
                path: "parentIpId";
              },
              {
                kind: "arg";
                path: "childIpId";
              },
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "parentIpAsset";
          docs: ["The IPAsset being added"];
        },
        {
          name: "childIpAsset";
          docs: ["The IPAsset being added"];
        },
      ];
      args: [
        {
          name: "parentIpId";
          type: "u64";
        },
        {
          name: "childIpId";
          type: "u64";
        },
      ];
    },
    {
      name: "createProvenanceClaim";
      discriminator: [250, 57, 196, 150, 208, 26, 180, 11];
      accounts: [
        {
          name: "provenanceClaim";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 114, 111, 118, 101, 110, 97, 110, 99, 101];
              },
              {
                kind: "account";
                path: "ipAsset";
              },
              {
                kind: "arg";
                path: "evidenceHash";
              },
            ];
          };
        },
        {
          name: "entityProgram";
          address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
        },
        {
          name: "ipAsset";
          docs: ["IP being referenced"];
        },
        {
          name: "entity";
          docs: ["Entity authority check happens at instruction layer"];
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "evidenceHash";
          type: "bytes";
        },
        {
          name: "uri";
          type: {
            option: "string";
          };
        },
      ];
    },
    {
      name: "freezeIp";
      discriminator: [213, 41, 157, 58, 118, 74, 164, 52];
      accounts: [
        {
          name: "entity";
        },
        {
          name: "ipAsset";
          writable: true;
        },
        {
          name: "entityProgram";
          address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
        },
      ];
      args: [];
    },
    {
      name: "initIpCounter";
      discriminator: [188, 104, 248, 176, 75, 130, 32, 73];
      accounts: [
        {
          name: "ipCounter";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 99, 111, 117, 110, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initIpRegistry";
      discriminator: [203, 77, 104, 116, 165, 32, 228, 42];
      accounts: [
        {
          name: "registry";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 114, 101, 103, 105, 115, 116, 114, 121];
              },
            ];
          };
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initModuleConfig";
      discriminator: [171, 237, 151, 118, 73, 160, 171, 74];
      accounts: [
        {
          name: "moduleConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  111,
                  100,
                  117,
                  108,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                ];
              },
              {
                kind: "account";
                path: "ipAsset";
              },
            ];
          };
        },
        {
          name: "ipAsset";
          docs: ["The IPAsset this config belongs to"];
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "initRegistryConfig";
      discriminator: [157, 90, 204, 184, 92, 221, 52, 86];
      accounts: [
        {
          name: "registryConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                ];
              },
            ];
          };
        },
        {
          name: "authority";
          docs: ["Protocol authority (governance)"];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "ipRegistrationFeeLamports";
          type: "u64";
        },
      ];
    },
    {
      name: "initRegistryConfigTreasury";
      discriminator: [235, 44, 74, 68, 47, 199, 52, 88];
      accounts: [
        {
          name: "registryConfigTreasury";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                ];
              },
            ];
          };
        },
        {
          name: "registryConfig";
        },
        {
          name: "authority";
          docs: ["Protocol authority (governance)"];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "registerIpAsset";
      discriminator: [155, 232, 254, 51, 137, 19, 196, 113];
      accounts: [
        {
          name: "entity";
        },
        {
          name: "entityProgram";
          address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
        },
        {
          name: "ipCounter";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 99, 111, 117, 110, 116, 101, 114];
              },
            ];
          };
        },
        {
          name: "ipAsset";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 97, 115, 115, 101, 116];
              },
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "ip_counter.next_ip_index";
                account: "ipCounter";
              },
            ];
          };
        },
        {
          name: "registryConfig";
        },
        {
          name: "registryConfigTreasury";
          writable: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "registrationFeeLamports";
          type: "u64";
        },
      ];
    },
    {
      name: "resolveParent";
      discriminator: [132, 92, 250, 173, 142, 65, 150, 225];
      accounts: [
        {
          name: "parentIp";
        },
        {
          name: "derivativeIp";
        },
        {
          name: "parentEntityAuthority";
          docs: ["Entity controller of the parent"];
          writable: true;
          signer: true;
        },
        {
          name: "derivativeLink";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  100,
                  101,
                  114,
                  105,
                  118,
                  97,
                  116,
                  105,
                  118,
                  101,
                  95,
                  108,
                  105,
                  110,
                  107,
                ];
              },
              {
                kind: "arg";
                path: "parentIpId";
              },
              {
                kind: "arg";
                path: "derivativeIpId";
              },
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "parentIpId";
          type: "u64";
        },
        {
          name: "derivativeIpId";
          type: "u64";
        },
      ];
    },
    {
      name: "updateRegistryConfig";
      discriminator: [205, 108, 204, 178, 107, 143, 150, 21];
      accounts: [
        {
          name: "registryConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                ];
              },
            ];
          };
        },
        {
          name: "authority";
          docs: ["Must be the protocol authority"];
          signer: true;
        },
      ];
      args: [
        {
          name: "newIpRegistrationFeeLamports";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "derivativeLink";
      discriminator: [203, 42, 152, 142, 174, 209, 228, 117];
    },
    {
      name: "entityAccount";
      discriminator: [46, 132, 149, 104, 229, 39, 46, 87];
    },
    {
      name: "ipAsset";
      discriminator: [157, 216, 58, 229, 111, 101, 192, 187];
    },
    {
      name: "ipCounter";
      discriminator: [154, 39, 148, 24, 230, 111, 125, 183];
    },
    {
      name: "ipRegistry";
      discriminator: [128, 96, 137, 212, 42, 77, 209, 85];
    },
    {
      name: "moduleConfig";
      discriminator: [203, 167, 250, 68, 11, 203, 244, 76];
    },
    {
      name: "provenanceClaim";
      discriminator: [164, 136, 146, 115, 227, 210, 79, 180];
    },
    {
      name: "registryConfig";
      discriminator: [23, 118, 10, 246, 173, 231, 243, 156];
    },
    {
      name: "registryConfigTreasury";
      discriminator: [253, 7, 14, 233, 255, 71, 109, 47];
    },
  ];
  events: [
    {
      name: "entityChanged";
      discriminator: [146, 0, 146, 23, 4, 76, 156, 159];
    },
    {
      name: "ipRegistered";
      discriminator: [83, 229, 161, 150, 13, 135, 162, 211];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "parentApprovalRequired";
      msg: "Parent entity approval required";
    },
    {
      code: 6001;
      name: "invalidTreasuryAccount";
      msg: "Invalid treasury account";
    },
    {
      code: 6002;
      name: "unauthorized";
      msg: "Caller is not registry authority";
    },
    {
      code: 6003;
      name: "registrationFeeError";
      msg: "Registration fee does not match";
    },
    {
      code: 6004;
      name: "ipFrozen";
      msg: "IP Already Frozen";
    },
    {
      code: 6005;
      name: "ipActive";
      msg: "IP is active";
    },
    {
      code: 6006;
      name: "entityPubkeySame";
      msg: "Entity pubkey is the same";
    },
    {
      code: 6007;
      name: "entityPubkeyDifferent";
      msg: "Entity pubkey is different";
    },
  ];
  types: [
    {
      name: "derivativeLink";
      type: {
        kind: "struct";
        fields: [
          {
            name: "parentIpId";
            type: "u64";
          },
          {
            name: "childIpId";
            type: "u64";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "status";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "entityAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "status";
            type: "u8";
          },
          {
            name: "controllerThreshold";
            type: "u8";
          },
          {
            name: "controllers";
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "updatedAt";
            type: "i64";
          },
          {
            name: "entityIndex";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "entityChanged";
      type: {
        kind: "struct";
        fields: [
          {
            name: "previousEntity";
            type: "pubkey";
          },
          {
            name: "ipAsset";
            type: "pubkey";
          },
          {
            name: "newEntity";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "ipAsset";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entity";
            type: "pubkey";
          },
          {
            name: "status";
            docs: ["Active / Frozen"];
            type: "u8";
          },
          {
            name: "updatedAt";
            type: "i64";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "ipIndex";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ipCounter";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "nextIpIndex";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "ipRegistered";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entity";
            type: "pubkey";
          },
          {
            name: "ipAsset";
            type: "pubkey";
          },
          {
            name: "ipIndex";
            type: "u64";
          },
          {
            name: "creator";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "ipRegistry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalIps";
            docs: ["Total number of IPAssets registered"];
            type: "u64";
          },
          {
            name: "ipAssets";
            docs: [
              "Flattened list of IPAsset keys (Phase 1: keep small, for demo)",
            ];
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "derivativeLinks";
            docs: [
              "Flattened list of derivative links per IP",
              "For Phase 1, we just store them sequentially for indexers",
            ];
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "createdAt";
            docs: ["Created timestamp"];
            type: "i64";
          },
        ];
      };
    },
    {
      name: "moduleConfig";
      docs: ["Phase 1 ModuleConfig PDA"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "ipAsset";
            docs: ["IPAsset this config belongs to"];
            type: "pubkey";
          },
          {
            name: "allowedModules";
            docs: [
              "Allowed modules (forward-compatible, Phase 1: just storage)",
            ];
            type: {
              vec: "pubkey";
            };
          },
          {
            name: "createdAt";
            docs: ["Created timestamp"];
            type: "i64";
          },
        ];
      };
    },
    {
      name: "provenanceClaim";
      type: {
        kind: "struct";
        fields: [
          {
            name: "ipAsset";
            docs: ["IP this evidence refers to"];
            type: "pubkey";
          },
          {
            name: "entity";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "evidenceHash";
            docs: [
              "Hash of off-chain evidence (e.g. SHA-256, Arweave TX, etc.)",
            ];
            type: "bytes";
          },
          {
            name: "uri";
            docs: ["URI to the evidence (IPFS, Arweave, HTTPS)"];
            type: "string";
          },
          {
            name: "createdAt";
            docs: ["Creation timestamp"];
            type: "i64";
          },
        ];
      };
    },
    {
      name: "registryConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            docs: ["Governance / protocol authority"];
            type: "pubkey";
          },
          {
            name: "ipRegistrationFeeLamports";
            docs: ["Fixed IP registration fee (lamports)"];
            type: "u64";
          },
          {
            name: "ipAsset";
            type: "pubkey";
          },
          {
            name: "createdAt";
            docs: ["Creation timestamp"];
            type: "i64";
          },
          {
            name: "bump";
            docs: ["Bump for PDA validation"];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "registryConfigTreasury";
      type: {
        kind: "struct";
        fields: [
          {
            name: "version";
            docs: ["Versioning for future upgrades"];
            type: "u8";
          },
          {
            name: "authority";
            docs: ["Governance / protocol authority"];
            type: "pubkey";
          },
          {
            name: "registryConfig";
            docs: ["Registry config this treasury belongs to"];
            type: "pubkey";
          },
          {
            name: "createdAt";
            docs: ["Created timestamp"];
            type: "i64";
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: "ipStateDerivativeUnanchored";
      type: "u8";
      value: "1";
    },
    {
      name: "ipStatusActive";
      type: "u8";
      value: "1";
    },
    {
      name: "ipStatusFrozen";
      type: "u8";
      value: "2";
    },
    {
      name: "linkStatusAsserted";
      type: "u8";
      value: "1";
    },
    {
      name: "linkStatusDisputed";
      type: "u8";
      value: "3";
    },
    {
      name: "linkStatusResolved";
      type: "u8";
      value: "2";
    },
  ];
};
