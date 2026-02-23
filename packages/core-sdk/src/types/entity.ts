/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/entity.json`.
 */
export type Entity = {
  address: "HdnQGSc8gYNDWdzGK5esrShESZwWi8LvSXxAkgqvByD1";
  metadata: {
    name: "entity";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "activateEntity";
      discriminator: [179, 185, 27, 83, 195, 230, 123, 9];
      accounts: [
        {
          name: "entity";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: "assertControllerThreshold";
      discriminator: [195, 68, 103, 16, 222, 131, 246, 134];
      accounts: [
        {
          name: "entity";
        },
      ];
      args: [];
    },
    {
      name: "freezeEntity";
      discriminator: [159, 136, 30, 2, 67, 167, 214, 147];
      accounts: [
        {
          name: "entity";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: "initEntityCounter";
      discriminator: [192, 181, 149, 83, 121, 120, 190, 113];
      accounts: [
        {
          name: "entityCounter";
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
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114,
                ];
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
      name: "initEntityTreasury";
      discriminator: [66, 233, 24, 140, 15, 239, 108, 43];
      accounts: [
        {
          name: "entity";
        },
        {
          name: "treasury";
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
              {
                kind: "account";
                path: "entity";
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
      name: "registerEntity";
      discriminator: [166, 52, 122, 244, 214, 116, 215, 255];
      accounts: [
        {
          name: "entityCounter";
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
                  99,
                  111,
                  117,
                  110,
                  116,
                  101,
                  114,
                ];
              },
            ];
          };
        },
        {
          name: "entity";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [101, 110, 116, 105, 116, 121];
              },
              {
                kind: "account";
                path: "payer";
              },
              {
                kind: "account";
                path: "entity_counter.next_entity_index";
                account: "entityCounter";
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
      args: [
        {
          name: "controllers";
          type: {
            vec: "pubkey";
          };
        },
        {
          name: "threshold";
          type: "u8";
        },
      ];
    },
    {
      name: "updateControllers";
      discriminator: [71, 2, 167, 69, 145, 109, 42, 139];
      accounts: [
        {
          name: "entity";
          writable: true;
        },
      ];
      args: [
        {
          name: "newControllers";
          type: {
            vec: "pubkey";
          };
        },
        {
          name: "newThreshold";
          type: "u8";
        },
      ];
    },
    {
      name: "updateEntityRevision";
      discriminator: [240, 144, 38, 246, 39, 252, 192, 234];
      accounts: [
        {
          name: "entity";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
        },
      ];
      args: [
        {
          name: "newRevision";
          type: "u64";
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
      name: "entityCounter";
      discriminator: [101, 1, 28, 203, 184, 98, 155, 3];
    },
    {
      name: "entityTreasury";
      discriminator: [158, 97, 79, 97, 49, 235, 122, 123];
    },
  ];
  events: [
    {
      name: "entityRegistered";
      discriminator: [207, 100, 27, 194, 243, 88, 104, 198];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "unauthorizedController";
      msg: "Signer is not a controller of this entity";
    },
    {
      code: 6001;
      name: "invalidControllerThreshold";
      msg: "Invalid controller threshold";
    },
    {
      code: 6002;
      name: "emptyControllerSet";
      msg: "Controller list cannot be empty";
    },
    {
      code: 6003;
      name: "duplicateControllers";
      msg: "Duplicate controllers are not allowed";
    },
    {
      code: 6004;
      name: "entityFrozen";
      msg: "Entity is frozen";
    },
    {
      code: 6005;
      name: "entityActive";
      msg: "Entity is active";
    },
    {
      code: 6006;
      name: "notEnoughControllerSigners";
      msg: "Not enough controller signers";
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
          {
            name: "latestRevision";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "entityCounter";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "nextEntityIndex";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "entityRegistered";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entity";
            type: "pubkey";
          },
          {
            name: "entityIndex";
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
      name: "entityTreasury";
      type: {
        kind: "struct";
        fields: [
          {
            name: "entity";
            docs: ["Entity this treasury belongs to"];
            type: "pubkey";
          },
          {
            name: "version";
            docs: ["Versioning for future upgrades"];
            type: "u8";
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
      name: "entityStatusActive";
      type: "u8";
      value: "1";
    },
    {
      name: "entityStatusFrozen";
      type: "u8";
      value: "2";
    },
  ];
};
