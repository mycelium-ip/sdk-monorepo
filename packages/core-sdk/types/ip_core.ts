/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ip_core.json`.
 */
export type IpCore = {
  "address": "8Yv28aduM7K63b7HVuXPj6fYW8pLagHm8AuJCYVxvV6G",
  "metadata": {
    "name": "ipCore",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Core logic for Mycelium IP Protocol"
  },
  "instructions": [
    {
      "name": "createDerivativeLink",
      "docs": [
        "Create a derivative link between IPs."
      ],
      "discriminator": [
        145,
        37,
        194,
        127,
        5,
        135,
        125,
        122
      ],
      "accounts": [
        {
          "name": "derivativeLink",
          "docs": [
            "The derivative link account to create (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  114,
                  105,
                  118,
                  97,
                  116,
                  105,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "parentIp"
              },
              {
                "kind": "account",
                "path": "childIp"
              }
            ]
          }
        },
        {
          "name": "parentIp",
          "docs": [
            "The parent IP."
          ]
        },
        {
          "name": "childIp",
          "docs": [
            "The child IP (derivative)."
          ]
        },
        {
          "name": "childOwnerEntity",
          "docs": [
            "The owner entity of the child IP."
          ]
        },
        {
          "name": "controller",
          "docs": [
            "The child owner entity controller (must sign)."
          ],
          "signer": true
        },
        {
          "name": "licenseGrant",
          "docs": [
            "The license grant account (owned by external license program)."
          ]
        },
        {
          "name": "license",
          "docs": [
            "The license account (owned by external license program)."
          ]
        },
        {
          "name": "payer",
          "docs": [
            "Payer for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "licenseProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createEntity",
      "docs": [
        "Create a new entity."
      ],
      "discriminator": [
        231,
        148,
        76,
        9,
        52,
        190,
        122,
        31
      ],
      "accounts": [
        {
          "name": "entity",
          "docs": [
            "The entity account to create (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "handle"
              }
            ]
          }
        },
        {
          "name": "creator",
          "docs": [
            "The creator of this entity (must sign).",
            "Also pays for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "handle",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createEntityMetadata",
      "docs": [
        "Create metadata for an entity."
      ],
      "discriminator": [
        206,
        211,
        171,
        106,
        161,
        192,
        50,
        7
      ],
      "accounts": [
        {
          "name": "metadata",
          "docs": [
            "The metadata account to create (PDA)."
          ],
          "writable": true
        },
        {
          "name": "entity",
          "docs": [
            "The entity to attach metadata to."
          ],
          "writable": true
        },
        {
          "name": "schema",
          "docs": [
            "The metadata schema this metadata conforms to."
          ]
        },
        {
          "name": "controller",
          "docs": [
            "The entity controller (must sign)."
          ],
          "signer": true
        },
        {
          "name": "payer",
          "docs": [
            "Payer for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "cid",
          "type": {
            "array": [
              "u8",
              96
            ]
          }
        }
      ]
    },
    {
      "name": "createIp",
      "docs": [
        "Register a new IP."
      ],
      "discriminator": [
        241,
        108,
        234,
        46,
        78,
        41,
        127,
        27
      ],
      "accounts": [
        {
          "name": "ip",
          "docs": [
            "The IP account to create (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  112
                ]
              },
              {
                "kind": "account",
                "path": "registrantEntity"
              },
              {
                "kind": "arg",
                "path": "contentHash"
              }
            ]
          }
        },
        {
          "name": "registrantEntity",
          "docs": [
            "The entity registering this IP."
          ]
        },
        {
          "name": "config",
          "docs": [
            "Protocol configuration."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "docs": [
            "Protocol treasury."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury's token account to receive the registration fee."
          ],
          "writable": true
        },
        {
          "name": "payerTokenAccount",
          "docs": [
            "Payer's token account to pay the registration fee."
          ],
          "writable": true
        },
        {
          "name": "controller",
          "docs": [
            "The entity controller (must sign)."
          ],
          "signer": true
        },
        {
          "name": "payer",
          "docs": [
            "Payer for account creation and registration fee."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "SPL Token program."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contentHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createIpMetadata",
      "docs": [
        "Create metadata for an IP."
      ],
      "discriminator": [
        170,
        218,
        79,
        21,
        199,
        157,
        101,
        42
      ],
      "accounts": [
        {
          "name": "metadata",
          "docs": [
            "The metadata account to create (PDA)."
          ],
          "writable": true
        },
        {
          "name": "ip",
          "docs": [
            "The IP to attach metadata to."
          ],
          "writable": true
        },
        {
          "name": "ownerEntity",
          "docs": [
            "The current owner entity of the IP."
          ]
        },
        {
          "name": "schema",
          "docs": [
            "The metadata schema this metadata conforms to."
          ]
        },
        {
          "name": "controller",
          "docs": [
            "The owner entity controller (must sign)."
          ],
          "signer": true
        },
        {
          "name": "payer",
          "docs": [
            "Payer for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "cid",
          "type": {
            "array": [
              "u8",
              96
            ]
          }
        }
      ]
    },
    {
      "name": "createMetadataSchema",
      "docs": [
        "Create a new metadata schema."
      ],
      "discriminator": [
        231,
        107,
        149,
        242,
        58,
        194,
        205,
        51
      ],
      "accounts": [
        {
          "name": "metadataSchema",
          "docs": [
            "The metadata schema account to create (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97,
                  95,
                  115,
                  99,
                  104,
                  101,
                  109,
                  97
                ]
              },
              {
                "kind": "arg",
                "path": "id"
              },
              {
                "kind": "arg",
                "path": "version"
              }
            ]
          }
        },
        {
          "name": "creator",
          "docs": [
            "The creator of this schema (must sign).",
            "Also pays for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "version",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "cid",
          "type": {
            "array": [
              "u8",
              96
            ]
          }
        }
      ]
    },
    {
      "name": "initializeConfig",
      "docs": [
        "Initialize the protocol configuration."
      ],
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "config",
          "docs": [
            "The config account to initialize (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The authority that will control the protocol config.",
            "Also pays for account creation."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "treasury",
          "type": "pubkey"
        },
        {
          "name": "registrationCurrency",
          "type": "pubkey"
        },
        {
          "name": "registrationFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeTreasury",
      "docs": [
        "Initialize the protocol treasury."
      ],
      "discriminator": [
        124,
        186,
        211,
        195,
        85,
        165,
        129,
        166
      ],
      "accounts": [
        {
          "name": "treasury",
          "docs": [
            "The treasury account to initialize (PDA)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "config",
          "docs": [
            "The protocol configuration account."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The config authority (must sign).",
            "Also pays for account creation."
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "transferEntityControl",
      "docs": [
        "Transfer entity control to a new controller."
      ],
      "discriminator": [
        1,
        75,
        135,
        215,
        37,
        147,
        111,
        129
      ],
      "accounts": [
        {
          "name": "entity",
          "docs": [
            "The entity to update."
          ],
          "writable": true
        },
        {
          "name": "controller",
          "docs": [
            "The current controller (must sign)."
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newController",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "transferIp",
      "docs": [
        "Transfer IP ownership."
      ],
      "discriminator": [
        75,
        161,
        2,
        114,
        236,
        211,
        90,
        39
      ],
      "accounts": [
        {
          "name": "ip",
          "docs": [
            "The IP account to transfer."
          ],
          "writable": true
        },
        {
          "name": "currentOwnerEntity",
          "docs": [
            "The current owner entity."
          ]
        },
        {
          "name": "newOwnerEntity",
          "docs": [
            "The new owner entity."
          ]
        },
        {
          "name": "controller",
          "docs": [
            "The current owner entity controller (must sign)."
          ],
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "docs": [
        "Update the protocol configuration."
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "config",
          "docs": [
            "The config account to update."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The current authority (must sign)."
          ],
          "signer": true,
          "relations": [
            "config"
          ]
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateConfigParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateDerivativeLicense",
      "docs": [
        "Update the license on a derivative link."
      ],
      "discriminator": [
        41,
        224,
        88,
        19,
        88,
        173,
        140,
        116
      ],
      "accounts": [
        {
          "name": "derivativeLink",
          "docs": [
            "The derivative link to update."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  114,
                  105,
                  118,
                  97,
                  116,
                  105,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "derivative_link.parent_ip",
                "account": "derivativeLink"
              },
              {
                "kind": "account",
                "path": "derivative_link.child_ip",
                "account": "derivativeLink"
              }
            ]
          }
        },
        {
          "name": "childIp",
          "docs": [
            "The child IP (for ownership verification)."
          ]
        },
        {
          "name": "childOwnerEntity",
          "docs": [
            "The owner entity of the child IP."
          ]
        },
        {
          "name": "parentIp",
          "docs": [
            "The parent IP (for license validation)."
          ]
        },
        {
          "name": "newLicenseGrant",
          "docs": [
            "The new license grant account (owned by external license program)."
          ]
        },
        {
          "name": "newLicense",
          "docs": [
            "The new license account (owned by external license program)."
          ]
        },
        {
          "name": "controller",
          "docs": [
            "The child owner entity controller (must sign)."
          ],
          "signer": true
        }
      ],
      "args": [
        {
          "name": "licenseProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "withdrawTreasury",
      "docs": [
        "Withdraw tokens from the protocol treasury."
      ],
      "discriminator": [
        40,
        63,
        122,
        158,
        144,
        216,
        83,
        96
      ],
      "accounts": [
        {
          "name": "treasury",
          "docs": [
            "The treasury account (PDA authority for token accounts)."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "The treasury's SPL token account to withdraw from."
          ],
          "writable": true
        },
        {
          "name": "destinationTokenAccount",
          "docs": [
            "The destination SPL token account."
          ],
          "writable": true
        },
        {
          "name": "authority",
          "docs": [
            "The treasury authority (must sign)."
          ],
          "signer": true,
          "relations": [
            "treasury"
          ]
        },
        {
          "name": "tokenProgram",
          "docs": [
            "SPL Token program."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "derivativeLink",
      "discriminator": [
        203,
        42,
        152,
        142,
        174,
        209,
        228,
        117
      ]
    },
    {
      "name": "entity",
      "discriminator": [
        46,
        157,
        161,
        161,
        254,
        46,
        79,
        24
      ]
    },
    {
      "name": "ipAccount",
      "discriminator": [
        97,
        57,
        119,
        87,
        95,
        245,
        239,
        253
      ]
    },
    {
      "name": "metadataAccount",
      "discriminator": [
        32,
        224,
        226,
        224,
        77,
        64,
        109,
        234
      ]
    },
    {
      "name": "metadataSchema",
      "discriminator": [
        27,
        2,
        79,
        28,
        153,
        167,
        124,
        115
      ]
    },
    {
      "name": "protocolConfig",
      "discriminator": [
        207,
        91,
        250,
        28,
        152,
        179,
        215,
        209
      ]
    },
    {
      "name": "protocolTreasury",
      "discriminator": [
        162,
        26,
        123,
        61,
        102,
        146,
        47,
        73
      ]
    }
  ],
  "events": [
    {
      "name": "configInitialized",
      "discriminator": [
        181,
        49,
        200,
        156,
        19,
        167,
        178,
        91
      ]
    },
    {
      "name": "configUpdated",
      "discriminator": [
        40,
        241,
        230,
        122,
        11,
        19,
        198,
        194
      ]
    },
    {
      "name": "derivativeLicenseUpdated",
      "discriminator": [
        224,
        105,
        250,
        233,
        66,
        19,
        49,
        196
      ]
    },
    {
      "name": "derivativeLinkCreated",
      "discriminator": [
        27,
        142,
        1,
        92,
        251,
        49,
        190,
        224
      ]
    },
    {
      "name": "entityControlTransferred",
      "discriminator": [
        45,
        239,
        120,
        115,
        218,
        39,
        118,
        113
      ]
    },
    {
      "name": "entityCreated",
      "discriminator": [
        125,
        231,
        125,
        132,
        13,
        116,
        119,
        126
      ]
    },
    {
      "name": "entityMetadataCreated",
      "discriminator": [
        107,
        58,
        16,
        150,
        116,
        245,
        192,
        239
      ]
    },
    {
      "name": "ipCreated",
      "discriminator": [
        145,
        44,
        30,
        88,
        215,
        11,
        28,
        168
      ]
    },
    {
      "name": "ipMetadataCreated",
      "discriminator": [
        151,
        13,
        118,
        107,
        237,
        73,
        83,
        176
      ]
    },
    {
      "name": "ipTransferred",
      "discriminator": [
        129,
        251,
        84,
        89,
        245,
        173,
        123,
        225
      ]
    },
    {
      "name": "metadataSchemaCreated",
      "discriminator": [
        38,
        11,
        65,
        175,
        140,
        7,
        31,
        74
      ]
    },
    {
      "name": "treasuryInitialized",
      "discriminator": [
        199,
        73,
        174,
        205,
        59,
        145,
        55,
        179
      ]
    },
    {
      "name": "treasuryWithdrawal",
      "discriminator": [
        244,
        117,
        175,
        46,
        187,
        109,
        20,
        16
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "configAlreadyInitialized",
      "msg": "Protocol configuration has already been initialized"
    },
    {
      "code": 6001,
      "name": "treasuryAlreadyInitialized",
      "msg": "Protocol treasury has already been initialized"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized: signer is not authorized to perform this action"
    },
    {
      "code": 6003,
      "name": "invalidAuthority",
      "msg": "Invalid authority provided"
    },
    {
      "code": 6004,
      "name": "entityNotInitialized",
      "msg": "Entity has not been initialized"
    },
    {
      "code": 6005,
      "name": "invalidHandle",
      "msg": "Invalid handle: must be lowercase alphanumeric (a-z, 0-9)"
    },
    {
      "code": 6006,
      "name": "handleTooLong",
      "msg": "Handle too long: maximum length is 32 characters"
    },
    {
      "code": 6007,
      "name": "handleAlreadyExists",
      "msg": "Handle already exists for this creator"
    },
    {
      "code": 6008,
      "name": "metadataSchemaNotFound",
      "msg": "Metadata schema not found"
    },
    {
      "code": 6009,
      "name": "invalidMetadataRevision",
      "msg": "Invalid metadata revision: must be exactly current revision + 1"
    },
    {
      "code": 6010,
      "name": "ipAlreadyExists",
      "msg": "IP already exists for this registrant and content hash"
    },
    {
      "code": 6011,
      "name": "invalidOwnership",
      "msg": "Invalid ownership: signer is not the owner"
    },
    {
      "code": 6012,
      "name": "derivativeAlreadyExists",
      "msg": "Derivative link already exists between parent and child IP"
    },
    {
      "code": 6013,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6014,
      "name": "emptyCid",
      "msg": "CID cannot be empty"
    },
    {
      "code": 6015,
      "name": "emptyHandle",
      "msg": "Handle cannot be empty"
    },
    {
      "code": 6016,
      "name": "invalidLicenseOwner",
      "msg": "Invalid license: account not owned by license program"
    },
    {
      "code": 6017,
      "name": "invalidLicenseOrigin",
      "msg": "Invalid license: does not reference the parent IP"
    },
    {
      "code": 6018,
      "name": "derivativesNotAllowed",
      "msg": "License does not allow derivatives"
    },
    {
      "code": 6019,
      "name": "licenseExpired",
      "msg": "License has expired"
    },
    {
      "code": 6020,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint: does not match registration currency"
    },
    {
      "code": 6021,
      "name": "invalidTreasuryAuthority",
      "msg": "Invalid treasury token account authority"
    },
    {
      "code": 6022,
      "name": "licenseGrantMismatch",
      "msg": "License grant does not reference the expected license"
    },
    {
      "code": 6023,
      "name": "invalidGrantee",
      "msg": "Grantee does not match the child owner entity"
    }
  ],
  "types": [
    {
      "name": "configInitialized",
      "docs": [
        "Emitted when protocol configuration is initialized."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "The config PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The protocol authority."
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "The treasury PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "registrationCurrency",
            "docs": [
              "The registration currency mint."
            ],
            "type": "pubkey"
          },
          {
            "name": "registrationFee",
            "docs": [
              "The registration fee amount."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "configUpdated",
      "docs": [
        "Emitted when protocol configuration is updated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "The config PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The authority who made the change."
            ],
            "type": "pubkey"
          },
          {
            "name": "newAuthority",
            "docs": [
              "New authority (if changed)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newTreasury",
            "docs": [
              "New treasury (if changed)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newRegistrationCurrency",
            "docs": [
              "New registration currency (if changed)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newRegistrationFee",
            "docs": [
              "New registration fee (if changed)."
            ],
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "derivativeLicenseUpdated",
      "docs": [
        "Emitted when a derivative link's license is updated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "derivativeLink",
            "docs": [
              "The derivative link PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "childIp",
            "docs": [
              "The child IP."
            ],
            "type": "pubkey"
          },
          {
            "name": "oldLicenseGrant",
            "docs": [
              "The previous license grant."
            ],
            "type": "pubkey"
          },
          {
            "name": "newLicenseGrant",
            "docs": [
              "The new license grant."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The authority (child owner entity) who authorized the change."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "derivativeLink",
      "docs": [
        "A link between a parent IP and a derivative (child) IP.",
        "",
        "Records that a child IP is derived from a parent IP under a specific license."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parentIp",
            "docs": [
              "The parent IP that this derivative is based on."
            ],
            "type": "pubkey"
          },
          {
            "name": "childIp",
            "docs": [
              "The child IP that is derived from the parent."
            ],
            "type": "pubkey"
          },
          {
            "name": "license",
            "docs": [
              "The license under which this derivative was created.",
              "Must be owned by the license program."
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this derivative link was created."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "derivativeLinkCreated",
      "docs": [
        "Emitted when a derivative link is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "derivativeLink",
            "docs": [
              "The derivative link PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "parentIp",
            "docs": [
              "The parent IP."
            ],
            "type": "pubkey"
          },
          {
            "name": "childIp",
            "docs": [
              "The child IP (derivative)."
            ],
            "type": "pubkey"
          },
          {
            "name": "licenseGrant",
            "docs": [
              "The license grant used."
            ],
            "type": "pubkey"
          },
          {
            "name": "childOwnerEntity",
            "docs": [
              "The child IP owner entity."
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "entity",
      "docs": [
        "An on-chain entity that can own IP and sign transactions.",
        "",
        "Entities use a single controller model. For multisig functionality,",
        "the controller can be set to an external multisig PDA (e.g., Squads)."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "docs": [
              "The original creator of this entity (immutable)."
            ],
            "type": "pubkey"
          },
          {
            "name": "handle",
            "docs": [
              "Unique handle for this entity (lowercase alphanumeric, immutable)."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "controller",
            "docs": [
              "The controller public key authorized to act on behalf of this entity.",
              "Can be an EOA or an external multisig PDA (e.g., Squads)."
            ],
            "type": "pubkey"
          },
          {
            "name": "currentMetadataRevision",
            "docs": [
              "Current metadata revision number.",
              "Incremented when new metadata is attached."
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this entity was created."
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Unix timestamp when this entity was last updated."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "entityControlTransferred",
      "docs": [
        "Emitted when entity control is transferred."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entity",
            "docs": [
              "The entity PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "oldController",
            "docs": [
              "The previous controller."
            ],
            "type": "pubkey"
          },
          {
            "name": "newController",
            "docs": [
              "The new controller."
            ],
            "type": "pubkey"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Update timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "entityCreated",
      "docs": [
        "Emitted when a new entity is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entity",
            "docs": [
              "The entity PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "creator",
            "docs": [
              "The entity creator."
            ],
            "type": "pubkey"
          },
          {
            "name": "handle",
            "docs": [
              "The entity handle."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "controller",
            "docs": [
              "The initial controller."
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "entityMetadataCreated",
      "docs": [
        "Emitted when entity metadata is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "metadata",
            "docs": [
              "The metadata PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "entity",
            "docs": [
              "The entity this metadata belongs to."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The entity (acts as authority)."
            ],
            "type": "pubkey"
          },
          {
            "name": "schema",
            "docs": [
              "The metadata schema."
            ],
            "type": "pubkey"
          },
          {
            "name": "revision",
            "docs": [
              "The metadata revision number."
            ],
            "type": "u64"
          },
          {
            "name": "hash",
            "docs": [
              "The metadata hash."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cid",
            "docs": [
              "The metadata CID."
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ipAccount",
      "docs": [
        "An on-chain IP (Intellectual Property) registration.",
        "",
        "Represents a claim to a specific piece of intellectual property,",
        "identified by its content hash."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contentHash",
            "docs": [
              "SHA-256 hash of the content (immutable)."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "registrantEntity",
            "docs": [
              "The entity that originally registered this IP (immutable)."
            ],
            "type": "pubkey"
          },
          {
            "name": "currentOwnerEntity",
            "docs": [
              "The entity that currently owns this IP.",
              "Can be transferred via transfer_ip instruction."
            ],
            "type": "pubkey"
          },
          {
            "name": "currentMetadataRevision",
            "docs": [
              "Current metadata revision number.",
              "Incremented when new metadata is attached."
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this IP was registered."
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Unix timestamp when this IP was last updated."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "ipCreated",
      "docs": [
        "Emitted when a new IP is registered."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ip",
            "docs": [
              "The IP account PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "contentHash",
            "docs": [
              "The content hash."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "registrantEntity",
            "docs": [
              "The registrant entity."
            ],
            "type": "pubkey"
          },
          {
            "name": "registrationFee",
            "docs": [
              "The registration fee paid."
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ipMetadataCreated",
      "docs": [
        "Emitted when IP metadata is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "metadata",
            "docs": [
              "The metadata PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "ip",
            "docs": [
              "The IP this metadata belongs to."
            ],
            "type": "pubkey"
          },
          {
            "name": "ownerEntity",
            "docs": [
              "The owner entity."
            ],
            "type": "pubkey"
          },
          {
            "name": "schema",
            "docs": [
              "The metadata schema."
            ],
            "type": "pubkey"
          },
          {
            "name": "revision",
            "docs": [
              "The metadata revision number."
            ],
            "type": "u64"
          },
          {
            "name": "hash",
            "docs": [
              "The metadata hash."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cid",
            "docs": [
              "The metadata CID."
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ipTransferred",
      "docs": [
        "Emitted when IP ownership is transferred."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ip",
            "docs": [
              "The IP account PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "fromEntity",
            "docs": [
              "The previous owner entity."
            ],
            "type": "pubkey"
          },
          {
            "name": "toEntity",
            "docs": [
              "The new owner entity."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The authority (from_entity) who authorized the transfer."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "metadataAccount",
      "docs": [
        "Metadata attached to an entity or IP.",
        "",
        "Contains a reference to a schema and the actual metadata content hash and CID."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "schema",
            "docs": [
              "Reference to the MetadataSchema this metadata conforms to."
            ],
            "type": "pubkey"
          },
          {
            "name": "hash",
            "docs": [
              "SHA-256 hash of the metadata content."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cid",
            "docs": [
              "IPFS CID pointing to the metadata content."
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "parentType",
            "docs": [
              "Type of parent (Entity or IP)."
            ],
            "type": {
              "defined": {
                "name": "metadataParentType"
              }
            }
          },
          {
            "name": "parent",
            "docs": [
              "Public key of the parent (Entity or IP account)."
            ],
            "type": "pubkey"
          },
          {
            "name": "revision",
            "docs": [
              "Monotonically increasing revision number."
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this metadata was created."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "metadataParentType",
      "docs": [
        "Type of parent that this metadata is attached to."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "entity"
          },
          {
            "name": "ip"
          }
        ]
      }
    },
    {
      "name": "metadataSchema",
      "docs": [
        "Metadata schema definition.",
        "",
        "Defines the structure and validation rules for metadata attached to entities or IPs."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "Unique identifier for this schema."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "version",
            "docs": [
              "Version string for this schema."
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "hash",
            "docs": [
              "SHA-256 hash of the schema definition."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cid",
            "docs": [
              "IPFS CID pointing to the schema definition."
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "creator",
            "docs": [
              "Creator of this schema."
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Unix timestamp when this schema was created."
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "metadataSchemaCreated",
      "docs": [
        "Emitted when a metadata schema is created."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "schema",
            "docs": [
              "The schema PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "schemaId",
            "docs": [
              "The schema ID."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "version",
            "docs": [
              "The schema version."
            ],
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "hash",
            "docs": [
              "The schema hash."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "cid",
            "docs": [
              "The schema CID."
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "creator",
            "docs": [
              "The schema creator."
            ],
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "docs": [
              "Creation timestamp."
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "protocolConfig",
      "docs": [
        "Protocol-wide configuration account.",
        "",
        "Controls registration fees and treasury settings."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority allowed to update configuration."
            ],
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "docs": [
              "The treasury PDA that receives registration fees."
            ],
            "type": "pubkey"
          },
          {
            "name": "registrationCurrency",
            "docs": [
              "The SPL token mint for registration fees."
            ],
            "type": "pubkey"
          },
          {
            "name": "registrationFee",
            "docs": [
              "The fee amount required to register an IP."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "protocolTreasury",
      "docs": [
        "Protocol treasury account.",
        "",
        "Acts as the authority for SPL token accounts that hold registration fees."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority allowed to withdraw from treasury."
            ],
            "type": "pubkey"
          },
          {
            "name": "config",
            "docs": [
              "Reference to the ProtocolConfig PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed."
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasuryInitialized",
      "docs": [
        "Emitted when protocol treasury is initialized."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasury",
            "docs": [
              "The treasury PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The treasury authority."
            ],
            "type": "pubkey"
          },
          {
            "name": "config",
            "docs": [
              "The protocol config PDA."
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "treasuryWithdrawal",
      "docs": [
        "Emitted when tokens are withdrawn from treasury."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasury",
            "docs": [
              "The treasury PDA."
            ],
            "type": "pubkey"
          },
          {
            "name": "authority",
            "docs": [
              "The authority who made the withdrawal."
            ],
            "type": "pubkey"
          },
          {
            "name": "destination",
            "docs": [
              "The destination token account."
            ],
            "type": "pubkey"
          },
          {
            "name": "mint",
            "docs": [
              "The token mint."
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount withdrawn."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updateConfigParams",
      "docs": [
        "Parameters for updating the config."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAuthority",
            "docs": [
              "New authority (optional)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newTreasury",
            "docs": [
              "New treasury PDA (optional)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newRegistrationCurrency",
            "docs": [
              "New registration currency mint (optional)."
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "newRegistrationFee",
            "docs": [
              "New registration fee (optional)."
            ],
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    }
  ]
};
