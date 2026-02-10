/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/metadata.json`.
 */
export type Metadata = {
  address: "E4gHpkjEMPh5GBDKKCqpnTMawfrZNqTGDZtjU6ZjM1YL";
  metadata: {
    name: "metadata";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "createEntityMetadata";
      discriminator: [206, 211, 171, 106, 161, 192, 50, 7];
      accounts: [
        {
          name: "entityMetadata";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  101,
                  110,
                  116,
                  105,
                  116,
                  121,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97,
                ];
              },
              {
                kind: "account";
                path: "entity";
              },
              {
                kind: "arg";
                path: "version";
              },
            ];
          };
        },
        {
          name: "entity";
          docs: ["Owning entity"];
        },
        {
          name: "schema";
          docs: ["Schema must exist"];
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
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
      ];
      args: [
        {
          name: "version";
          type: "u64";
        },
        {
          name: "metadataUri";
          type: "string";
        },
      ];
    },
    {
      name: "createIpMetadata";
      discriminator: [170, 218, 79, 21, 199, 157, 101, 42];
      accounts: [
        {
          name: "ipMetadata";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "account";
                path: "ipAsset";
              },
              {
                kind: "arg";
                path: "version";
              },
            ];
          };
        },
        {
          name: "ipAsset";
          docs: ["IP being annotated"];
        },
        {
          name: "entity";
          docs: ["IP being annotated"];
        },
        {
          name: "schema";
          docs: ["Schema must exist (enforced reference)"];
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "version";
          type: "u64";
        },
        {
          name: "metadataUri";
          type: "string";
        },
      ];
    },
    {
      name: "lockEntityMetadata";
      discriminator: [245, 29, 202, 77, 190, 35, 208, 234];
      accounts: [
        {
          name: "metadata";
          writable: true;
        },
        {
          name: "entity";
        },
        {
          name: "authority";
          signer: true;
        },
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
      ];
      args: [];
    },
    {
      name: "lockIpMetadata";
      discriminator: [4, 208, 66, 135, 24, 41, 38, 204];
      accounts: [
        {
          name: "metadata";
          writable: true;
        },
        {
          name: "entity";
        },
        {
          name: "ipAsset";
        },
        {
          name: "authority";
          signer: true;
        },
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
      ];
      args: [];
    },
    {
      name: "registerSchema";
      discriminator: [177, 252, 118, 252, 113, 195, 220, 14];
      accounts: [
        {
          name: "schema";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 99, 104, 101, 109, 97];
              },
              {
                kind: "arg";
                path: "category";
              },
              {
                kind: "arg";
                path: "version";
              },
            ];
          };
        },
        {
          name: "creator";
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
          name: "category";
          type: "string";
        },
        {
          name: "schemaUri";
          type: "string";
        },
        {
          name: "version";
          type: "u64";
        },
      ];
    },
    {
      name: "updateEntityMetadata";
      discriminator: [152, 231, 134, 248, 170, 240, 38, 115];
      accounts: [
        {
          name: "entity";
        },
        {
          name: "previousMetadata";
          docs: ["Previous metadata version (optional for v1)"];
        },
        {
          name: "newMetadata";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  101,
                  110,
                  116,
                  105,
                  116,
                  121,
                  95,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97,
                ];
              },
              {
                kind: "account";
                path: "entity";
              },
              {
                kind: "arg";
                path: "version";
              },
            ];
          };
        },
        {
          name: "schema";
        },
        {
          name: "authority";
          docs: ["Must be entity controller"];
          signer: true;
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
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
      ];
      args: [
        {
          name: "version";
          type: "u64";
        },
        {
          name: "metadataUri";
          type: "string";
        },
      ];
    },
    {
      name: "updateIpMetadata";
      discriminator: [37, 176, 216, 119, 26, 193, 236, 92];
      accounts: [
        {
          name: "ipAsset";
          writable: true;
        },
        {
          name: "entity";
          docs: ["Entity owning the IP"];
        },
        {
          name: "previousMetadata";
        },
        {
          name: "newMetadata";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [105, 112, 95, 109, 101, 116, 97, 100, 97, 116, 97];
              },
              {
                kind: "account";
                path: "ipAsset";
              },
              {
                kind: "arg";
                path: "version";
              },
            ];
          };
        },
        {
          name: "schema";
        },
        {
          name: "authority";
          docs: ["Must be controller of the entity"];
          signer: true;
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
        {
          name: "entityProgram";
          address: "8eUDT3ELUStHNWmYmtCVwhGW9HdxTSW47N2AuBuJRMmh";
        },
      ];
      args: [
        {
          name: "version";
          type: "u64";
        },
        {
          name: "metadataUri";
          type: "string";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "entityAccount";
      discriminator: [46, 132, 149, 104, 229, 39, 46, 87];
    },
    {
      name: "entityMetadata";
      discriminator: [169, 25, 203, 216, 51, 80, 76, 79];
    },
    {
      name: "ipAsset";
      discriminator: [157, 216, 58, 229, 111, 101, 192, 187];
    },
    {
      name: "ipMetadata";
      discriminator: [80, 200, 252, 27, 169, 52, 116, 110];
    },
    {
      name: "schemaRegistry";
      discriminator: [67, 184, 244, 100, 7, 70, 92, 51];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "unauthorized";
      msg: "Unauthorized controller";
    },
    {
      code: 6001;
      name: "targetFrozen";
      msg: "Target is frozen";
    },
    {
      code: 6002;
      name: "invalidVersionIncrement";
      msg: "Invalid metadata version increment";
    },
    {
      code: 6003;
      name: "alreadyLocked";
      msg: "Metadata already locked";
    },
    {
      code: 6004;
      name: "versionOverflow";
      msg: "Version overflow";
    },
    {
      code: 6005;
      name: "invalidVersion";
      msg: "Invalid version";
    },
  ];
  types: [
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
      name: "entityMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entity";
            docs: ["Entity this metadata belongs to"];
            type: "pubkey";
          },
          {
            name: "schema";
            docs: ["SchemaRegistry reference"];
            type: "pubkey";
          },
          {
            name: "version";
            type: "u64";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "createdAt";
            docs: ["Creation timestamp"];
            type: "i64";
          },
          {
            name: "locked";
            type: "bool";
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
            name: "expectedParentCount";
            type: "u8";
          },
          {
            name: "resolvedParentCount";
            type: "u8";
          },
          {
            name: "derivativeState";
            type: "u8";
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
      name: "ipMetadata";
      type: {
        kind: "struct";
        fields: [
          {
            name: "ipAsset";
            docs: ["IPAsset this metadata belongs to"];
            type: "pubkey";
          },
          {
            name: "schema";
            docs: ["SchemaRegistry reference (enforced)"];
            type: "pubkey";
          },
          {
            name: "version";
            type: "u64";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "createdAt";
            docs: ["Creation timestamp"];
            type: "i64";
          },
          {
            name: "locked";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "schemaRegistry";
      type: {
        kind: "struct";
        fields: [
          {
            name: "version";
            docs: [
              "The version of this schema (allows for iteration via new PDAs)",
            ];
            type: "u64";
          },
          {
            name: "category";
            docs: ["Length 32 allows for descriptive slugs"];
            type: "string";
          },
          {
            name: "schemaUri";
            docs: [
              "The URI (IPFS/Arweave) pointing to the JSON Schema definition",
            ];
            type: "string";
          },
          {
            name: "creator";
            docs: ["The address that registered this schema"];
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
        ];
      };
    },
  ];
};
