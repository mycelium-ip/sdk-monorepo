/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/license.json`.
 */
export type License = {
  address: "8iA7LYmvxr3SL8ZzTAZtbXfcGGjMpNQz116oeSiAEt1Q";
  metadata: {
    name: "license";
    version: "0.1.0";
    spec: "0.1.0";
    description: "License management for Mycelium IP Protocol";
  };
  instructions: [
    {
      name: "createLicense";
      docs: [
        "Create a new license for an IP.",
        "",
        "# Arguments",
        "* `derivatives_allowed` - Whether this license allows derivative creation",
        "* `ip_core_program_id` - The ip_core program ID for validation",
        "",
        "# Requirements",
        "- Origin IP must exist and be owned by ip_core",
        "- Origin IP must NOT be a derivative",
        "- IP owner entity controller signature required",
      ];
      discriminator: [191, 44, 164, 1, 58, 201, 203, 51];
      accounts: [
        {
          name: "license";
          docs: ["The license account to create (PDA)."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 105, 99, 101, 110, 115, 101];
              },
              {
                kind: "account";
                path: "originIp";
              },
            ];
          };
        },
        {
          name: "originIp";
          docs: [
            "The IP account to create a license for.",
            "Must be owned by ip_core program.",
          ];
        },
        {
          name: "ownerEntity";
          docs: [
            "The owner entity of the IP.",
            "Must match origin_ip.current_owner_entity.",
          ];
        },
        {
          name: "controller";
          docs: ["The entity controller (must match owner_entity.controller)."];
          signer: true;
        },
        {
          name: "derivativeCheck";
          docs: [
            "Optional: DerivativeLink account to check if this IP is a derivative.",
            "If this account exists where child_ip == origin_ip, creation fails.",
          ];
          optional: true;
        },
        {
          name: "payer";
          docs: ["Payer for account creation."];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["System program for account creation."];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "derivativesAllowed";
          type: "bool";
        },
        {
          name: "ipCoreProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "createLicenseGrant";
      docs: [
        "Create a license grant for a grantee entity.",
        "",
        "# Arguments",
        "* `expiration` - Expiration timestamp (0 = no expiration)",
        "* `ip_core_program_id` - The ip_core program ID for validation",
        "",
        "# Requirements",
        "- License must exist",
        "- Grantee entity must exist and be owned by ip_core",
        "- License authority entity controller signature required",
      ];
      discriminator: [220, 12, 111, 39, 146, 113, 120, 82];
      accounts: [
        {
          name: "licenseGrant";
          docs: ["The license grant account to create (PDA)."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  108,
                  105,
                  99,
                  101,
                  110,
                  115,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                ];
              },
              {
                kind: "account";
                path: "license";
              },
              {
                kind: "account";
                path: "granteeEntity";
              },
            ];
          };
        },
        {
          name: "license";
          docs: ["The license to grant."];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 105, 99, 101, 110, 115, 101];
              },
              {
                kind: "account";
                path: "license.origin_ip";
                account: "license";
              },
            ];
          };
        },
        {
          name: "authorityEntity";
          docs: [
            "The authority entity (must match license.authority).",
            "This is the IP owner who grants licenses.",
          ];
        },
        {
          name: "controller";
          docs: [
            "The entity controller (must match authority_entity.controller).",
          ];
          signer: true;
        },
        {
          name: "granteeEntity";
          docs: ["The grantee entity receiving the license."];
        },
        {
          name: "payer";
          docs: ["Payer for account creation."];
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          docs: ["System program for account creation."];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "expiration";
          type: "i64";
        },
        {
          name: "ipCoreProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "revokeLicense";
      docs: [
        "Revoke a license by closing its account.",
        "",
        "# Arguments",
        "* `ip_core_program_id` - The ip_core program ID for validation",
        "",
        "# Note",
        "This closes the license account and returns rent to the destination.",
      ];
      discriminator: [97, 10, 143, 67, 35, 212, 153, 8];
      accounts: [
        {
          name: "license";
          docs: ["The license account to close."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 105, 99, 101, 110, 115, 101];
              },
              {
                kind: "account";
                path: "license.origin_ip";
                account: "license";
              },
            ];
          };
        },
        {
          name: "authorityEntity";
          docs: ["The authority entity (must match license.authority)."];
        },
        {
          name: "controller";
          docs: [
            "The entity controller (must match authority_entity.controller).",
          ];
          signer: true;
        },
        {
          name: "rentDestination";
          docs: ["Destination for rent refund."];
          writable: true;
        },
        {
          name: "systemProgram";
          docs: ["System program."];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "ipCoreProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "revokeLicenseGrant";
      docs: [
        "Revoke a license grant by closing its account.",
        "",
        "# Arguments",
        "* `ip_core_program_id` - The ip_core program ID for validation",
        "",
        "# Note",
        "Grantee consent is NOT required. This closes the grant account",
        "and returns rent to the destination.",
      ];
      discriminator: [79, 187, 74, 159, 83, 60, 87, 58];
      accounts: [
        {
          name: "licenseGrant";
          docs: ["The license grant account to close."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  108,
                  105,
                  99,
                  101,
                  110,
                  115,
                  101,
                  95,
                  103,
                  114,
                  97,
                  110,
                  116,
                ];
              },
              {
                kind: "account";
                path: "license";
              },
              {
                kind: "account";
                path: "license_grant.grantee";
                account: "licenseGrant";
              },
            ];
          };
        },
        {
          name: "license";
          docs: ["The license this grant is for."];
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 105, 99, 101, 110, 115, 101];
              },
              {
                kind: "account";
                path: "license.origin_ip";
                account: "license";
              },
            ];
          };
        },
        {
          name: "authorityEntity";
          docs: ["The authority entity (must match license.authority)."];
        },
        {
          name: "controller";
          docs: [
            "The entity controller (must match authority_entity.controller).",
          ];
          signer: true;
        },
        {
          name: "rentDestination";
          docs: ["Destination for rent refund."];
          writable: true;
        },
        {
          name: "systemProgram";
          docs: ["System program."];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "ipCoreProgramId";
          type: "pubkey";
        },
      ];
    },
    {
      name: "updateLicense";
      docs: [
        "Update a license's terms.",
        "",
        "# Arguments",
        "* `derivatives_allowed` - New value for derivatives_allowed",
        "* `ip_core_program_id` - The ip_core program ID for validation",
        "",
        "# Note",
        "Only `derivatives_allowed` may be updated. Origin IP and authority are immutable.",
      ];
      discriminator: [249, 191, 202, 169, 155, 81, 176, 45];
      accounts: [
        {
          name: "license";
          docs: ["The license account to update."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [108, 105, 99, 101, 110, 115, 101];
              },
              {
                kind: "account";
                path: "license.origin_ip";
                account: "license";
              },
            ];
          };
        },
        {
          name: "authorityEntity";
          docs: ["The authority entity (must match license.authority)."];
        },
        {
          name: "controller";
          docs: [
            "The entity controller (must match authority_entity.controller).",
          ];
          signer: true;
        },
        {
          name: "systemProgram";
          docs: [
            "System program (not strictly needed but included for consistency).",
          ];
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "derivativesAllowed";
          type: "bool";
        },
        {
          name: "ipCoreProgramId";
          type: "pubkey";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "entity";
      discriminator: [46, 157, 161, 161, 254, 46, 79, 24];
    },
    {
      name: "ipAccount";
      discriminator: [97, 57, 119, 87, 95, 245, 239, 253];
    },
    {
      name: "license";
      discriminator: [248, 152, 195, 100, 185, 108, 176, 231];
    },
    {
      name: "licenseGrant";
      discriminator: [19, 253, 88, 68, 201, 150, 58, 227];
    },
  ];
  events: [
    {
      name: "licenseCreated";
      discriminator: [105, 38, 238, 189, 101, 241, 12, 157];
    },
    {
      name: "licenseGrantCreated";
      discriminator: [153, 223, 191, 253, 76, 79, 195, 58];
    },
    {
      name: "licenseGrantRevoked";
      discriminator: [204, 61, 11, 39, 208, 191, 66, 242];
    },
    {
      name: "licenseRevoked";
      discriminator: [185, 114, 47, 171, 61, 106, 25, 24];
    },
    {
      name: "licenseUpdated";
      discriminator: [62, 154, 41, 164, 197, 7, 26, 54];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "licenseAlreadyExists";
      msg: "License already exists for this IP";
    },
    {
      code: 6001;
      name: "licenseGrantAlreadyExists";
      msg: "License grant already exists for this license and grantee";
    },
    {
      code: 6002;
      name: "unauthorized";
      msg: "Unauthorized: signer is not authorized to perform this action";
    },
    {
      code: 6003;
      name: "invalidOriginIp";
      msg: "Invalid origin IP: must be a valid non-derivative IP owned by ip_core";
    },
    {
      code: 6004;
      name: "derivativeCannotCreateLicense";
      msg: "Derivative IP cannot create license: derivatives inherit parent licensing terms";
    },
    {
      code: 6005;
      name: "licenseNotFound";
      msg: "License not found";
    },
    {
      code: 6006;
      name: "licenseGrantNotFound";
      msg: "License grant not found";
    },
    {
      code: 6007;
      name: "grantExpired";
      msg: "License grant has expired";
    },
    {
      code: 6008;
      name: "derivativesNotAllowed";
      msg: "License does not allow derivative creation";
    },
    {
      code: 6009;
      name: "invalidAuthority";
      msg: "Invalid authority provided";
    },
    {
      code: 6010;
      name: "invalidGrantee";
      msg: "Invalid grantee: must be a valid entity owned by ip_core";
    },
    {
      code: 6011;
      name: "invalidLicense";
      msg: "Invalid license reference";
    },
    {
      code: 6012;
      name: "arithmeticOverflow";
      msg: "Arithmetic overflow";
    },
    {
      code: 6013;
      name: "activeGrantsExist";
      msg: "Cannot revoke license with active grants";
    },
  ];
  types: [
    {
      name: "entity";
      docs: [
        "An on-chain entity that can own IP and sign transactions.",
        "",
        "Entities use a single controller model. For multisig functionality,",
        "the controller can be set to an external multisig PDA (e.g., Squads).",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            docs: ["The original creator of this entity (immutable)."];
            type: "pubkey";
          },
          {
            name: "handle";
            docs: [
              "Unique handle for this entity (lowercase alphanumeric, immutable).",
            ];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "controller";
            docs: [
              "The controller public key authorized to act on behalf of this entity.",
              "Can be an EOA or an external multisig PDA (e.g., Squads).",
            ];
            type: "pubkey";
          },
          {
            name: "currentMetadataRevision";
            docs: [
              "Current metadata revision number.",
              "Incremented when new metadata is attached.",
            ];
            type: "u64";
          },
          {
            name: "createdAt";
            docs: ["Unix timestamp when this entity was created."];
            type: "i64";
          },
          {
            name: "updatedAt";
            docs: ["Unix timestamp when this entity was last updated."];
            type: "i64";
          },
          {
            name: "bump";
            docs: ["PDA bump seed."];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "ipAccount";
      docs: [
        "An on-chain IP (Intellectual Property) registration.",
        "",
        "Represents a claim to a specific piece of intellectual property,",
        "identified by its content hash.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "contentHash";
            docs: ["SHA-256 hash of the content (immutable)."];
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "registrantEntity";
            docs: [
              "The entity that originally registered this IP (immutable).",
            ];
            type: "pubkey";
          },
          {
            name: "currentOwnerEntity";
            docs: [
              "The entity that currently owns this IP.",
              "Can be transferred via transfer_ip instruction.",
            ];
            type: "pubkey";
          },
          {
            name: "currentMetadataRevision";
            docs: [
              "Current metadata revision number.",
              "Incremented when new metadata is attached.",
            ];
            type: "u64";
          },
          {
            name: "createdAt";
            docs: ["Unix timestamp when this IP was registered."];
            type: "i64";
          },
          {
            name: "updatedAt";
            docs: ["Unix timestamp when this IP was last updated."];
            type: "i64";
          },
          {
            name: "bump";
            docs: ["PDA bump seed."];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "license";
      docs: [
        "A license attached to an IP, defining usage terms.",
        "",
        "Licenses are permanent and define what operations are permitted",
        "for the associated IP (e.g., derivative creation).",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "originIp";
            docs: ["The IP this license is attached to (immutable)."];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: [
              "The entity that has authority over this license (immutable).",
              "This is the IP owner at the time of license creation.",
            ];
            type: "pubkey";
          },
          {
            name: "derivativesAllowed";
            docs: ["Whether derivatives are allowed under this license."];
            type: "bool";
          },
          {
            name: "createdAt";
            docs: ["Unix timestamp when this license was created."];
            type: "i64";
          },
          {
            name: "bump";
            docs: ["PDA bump seed."];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "licenseCreated";
      docs: ["Emitted when a new license is created."];
      type: {
        kind: "struct";
        fields: [
          {
            name: "license";
            docs: ["The license PDA."];
            type: "pubkey";
          },
          {
            name: "originIp";
            docs: ["The origin IP this license is for."];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: ["The authority entity (IP owner)."];
            type: "pubkey";
          },
          {
            name: "derivativesAllowed";
            docs: ["Whether derivatives are allowed."];
            type: "bool";
          },
          {
            name: "createdAt";
            docs: ["Creation timestamp."];
            type: "i64";
          },
        ];
      };
    },
    {
      name: "licenseGrant";
      docs: [
        "A grant of license rights to a specific entity.",
        "",
        "Grants allow entities to use an IP under the terms of its license.",
        "The grant may be permanent (expiration = 0) or time-limited.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "license";
            docs: ["The license this grant is for (immutable)."];
            type: "pubkey";
          },
          {
            name: "grantee";
            docs: ["The entity that has been granted rights (immutable)."];
            type: "pubkey";
          },
          {
            name: "grantedAt";
            docs: ["Unix timestamp when this grant was created (immutable)."];
            type: "i64";
          },
          {
            name: "expiration";
            docs: ["Expiration timestamp (0 = no expiration)."];
            type: "i64";
          },
          {
            name: "bump";
            docs: ["PDA bump seed."];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "licenseGrantCreated";
      docs: ["Emitted when a new license grant is created."];
      type: {
        kind: "struct";
        fields: [
          {
            name: "licenseGrant";
            docs: ["The license grant PDA."];
            type: "pubkey";
          },
          {
            name: "license";
            docs: ["The license this grant is for."];
            type: "pubkey";
          },
          {
            name: "grantee";
            docs: ["The grantee entity."];
            type: "pubkey";
          },
          {
            name: "expiration";
            docs: ["Grant expiration (0 = no expiration)."];
            type: "i64";
          },
          {
            name: "grantedAt";
            docs: ["Grant timestamp."];
            type: "i64";
          },
        ];
      };
    },
    {
      name: "licenseGrantRevoked";
      docs: ["Emitted when a license grant is revoked (closed)."];
      type: {
        kind: "struct";
        fields: [
          {
            name: "licenseGrant";
            docs: ["The license grant PDA."];
            type: "pubkey";
          },
          {
            name: "license";
            docs: ["The license this grant was for."];
            type: "pubkey";
          },
          {
            name: "grantee";
            docs: ["The grantee entity."];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: ["The authority entity who revoked."];
            type: "pubkey";
          },
          {
            name: "rentDestination";
            docs: ["Destination for rent refund."];
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "licenseRevoked";
      docs: ["Emitted when a license is revoked (closed)."];
      type: {
        kind: "struct";
        fields: [
          {
            name: "license";
            docs: ["The license PDA."];
            type: "pubkey";
          },
          {
            name: "originIp";
            docs: ["The origin IP this license was for."];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: ["The authority entity (IP owner)."];
            type: "pubkey";
          },
          {
            name: "rentDestination";
            docs: ["Destination for rent refund."];
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "licenseUpdated";
      docs: ["Emitted when a license is updated."];
      type: {
        kind: "struct";
        fields: [
          {
            name: "license";
            docs: ["The license PDA."];
            type: "pubkey";
          },
          {
            name: "originIp";
            docs: ["The origin IP this license is for."];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: ["The authority entity (IP owner)."];
            type: "pubkey";
          },
          {
            name: "oldDerivativesAllowed";
            docs: ["Previous derivatives_allowed value."];
            type: "bool";
          },
          {
            name: "newDerivativesAllowed";
            docs: ["New derivatives_allowed value."];
            type: "bool";
          },
        ];
      };
    },
  ];
};
