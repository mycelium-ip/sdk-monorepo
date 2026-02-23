export const entityMetadataExampleJson = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  schema_id: "entity.metadata.v1",
  name: "Entity Metadata",
  description:
    "Public identity metadata for entities registered in the Mycelium IP Protocol",
  version: "1.0.0",
  type: "object",
  additionalProperties: false,
  required: ["displayName", "handle", "entityType"],
  properties: {
    createdAt: {
      type: "string",
      format: "date-time",
    },

    displayName: {
      type: "string",
      minLength: 3,
      maxLength: 100,
    },

    handle: {
      type: "string",
      minLength: 3,
      maxLength: 32,
      pattern: "^[a-zA-Z0-9_\\-]+$",
      description: "Unique, URL-safe identifier",
    },

    description: {
      type: "string",
      maxLength: 500,
    },

    entityType: {
      type: "string",
      enum: [
        "personal",
        "company",
        "organization",
        "studio",
        "publisher",
        "other",
      ],
    },

    jurisdiction: {
      type: "string",
      minLength: 2,
      maxLength: 2,
      description: "ISO 3166-1 alpha-2 country code",
    },

    website: {
      type: "string",
      format: "uri",
    },

    phone: {
      type: "string",
      minLength: 7,
      maxLength: 15,
    },

    socials: {
      type: "array",
      items: {
        type: "object",
        required: ["platform", "url"],
        additionalProperties: false,
        properties: {
          platform: {
            type: "string",
            enum: ["twitter", "discord", "github", "linkedin", "other"],
          },

          url: {
            type: "string",
            format: "uri",
          },
        },
      },
    },

    tags: {
      type: "array",
      items: {
        type: "string",
        minLength: 1,
        maxLength: 32,
      },
    },

    avatarCid: {
      type: "string",
    },

    bannerCid: {
      type: "string",
    },
  },
};

export const ipMetadataExampleJson = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  schema_id: "ip.metadata.v1",
  name: "IP Metadata",
  description:
    "Metadata schema for intellectual property registered in the Mycelium IP Protocol",
  version: "1.0.0",
  type: "object",
  additionalProperties: false,
  required: ["title", "creators", "createdAt", "assets"],
  properties: {
    createdAt: {
      type: "string",
      format: "date-time",
    },

    title: {
      type: "string",
    },

    description: {
      type: "string",
    },

    category: {
      type: "string",
    },

    tags: {
      type: "array",
      items: { type: "string" },
    },

    creators: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "role"],
        properties: {
          name: { type: "string" },
          role: { type: "string" },
        },
      },
    },

    country: {
      type: "string",
      minLength: 2,
      maxLength: 2,
      description: "ISO 3166-1 alpha-2 country code",
    },

    city: {
      type: "string",
    },

    logoCid: {
      type: "string",
      description: "CID of logo image for IP",
    },

    assets: {
      type: "array",
      items: {
        type: "object",
        required: ["cid", "filename", "hash", "role", "fileType"],
        properties: {
          cid: {
            type: "string",
          },

          filename: {
            type: "string",
          },

          hash: {
            type: "string",
            description: "SHA256 of file",
          },

          size: {
            type: "number",
          },

          mimeType: {
            type: "string",
          },

          fileType: {
            type: "string",
            enum: [
              "image",
              "audio",
              "video",
              "document",
              "archive",
              "model",
              "code",
              "dataset",
              "text",
              "link",
            ],
          },

          role: {
            type: "string",
            enum: [
              "master",
              "source",
              "publication",
              "preview",
              "draft",
              "archive",
              "documentation",
              "contract",
              "reference",
              "deliverable",
            ],
          },

          version: {
            type: "string",
          },
        },
      },
    },

    externalLinks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          url: { type: "string", format: "uri" },
        },
      },
    },

    license: {
      type: "object",
      properties: {
        type: { type: "string" },
        terms: { type: "string" },
      },
    },
  },
};
