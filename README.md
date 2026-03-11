# Mycelium IP SDK

Comprehensive toolkit for building applications on top of the [Mycelium IP Protocol](https://myceliumip.com) on Solana.

## Packages

| Package                                        | Version          | Description                                                                                                              |
| ---------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`@mycelium-ip/core-sdk`](./packages/core-sdk) | `0.2.0-alpha.14` | TypeScript client for the Mycelium IP Solana programs — PDA derivation, instruction building, and transaction submission |
| [`@mycelium-ip/react`](./packages/react)       | `0.1.0-alpha.16` | React hooks powered by TanStack Query — thin wrapper over the core SDK for use in React and Next.js apps                 |

## Quick Start

### Core SDK

```bash
pnpm add @mycelium-ip/core-sdk
```

```ts
import { Connection } from "@solana/web3.js";
import { MyceliumClient } from "@mycelium-ip/core-sdk";
import type { Wallet } from "@wallet-standard/base";

const connection = new Connection("https://api.devnet.solana.com");
const wallet: Wallet = /* any Wallet Standard–compliant wallet */;

const client = new MyceliumClient({ connection, wallet, cluster: "devnet" });

// Use program clients
const ix = await client.ipCore.entity.create({ /* ... */ });
const tx = await client.license.license.create({ /* ... */ });
```

### React

```bash
pnpm add @mycelium-ip/react @mycelium-ip/core-sdk
```

```tsx
import { Connection } from "@solana/web3.js";
import { MyceliumIpProvider, useCreateEntity } from "@mycelium-ip/react";
import type { Wallet } from "@wallet-standard/base";

function App() {
  const connection = new Connection("https://api.devnet.solana.com");
  const wallet: Wallet = useYourWallet();

  return (
    <MyceliumIpProvider connection={connection} wallet={wallet}>
      <CreateEntityButton />
    </MyceliumIpProvider>
  );
}

function CreateEntityButton() {
  const { mutate, isPending } = useCreateEntity();

  return (
    <button
      onClick={() =>
        mutate({
          handle: new TextEncoder().encode("my-entity"),
          additionalControllers: [],
          signatureThreshold: 1,
        })
      }
      disabled={isPending}
    >
      {isPending ? "Creating..." : "Create Entity"}
    </button>
  );
}
```

Peer dependencies for the React package:

```bash
pnpm add @solana/web3.js @tanstack/react-query react
```

## Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 10
- A Solana `Connection`
- A [Wallet Standard](https://github.com/wallet-standard/wallet-standard)–compliant wallet with `solana:signTransaction` support

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type-check
pnpm typecheck
```

This monorepo uses [Turborepo](https://turbo.build) for task orchestration and [Changesets](https://github.com/changesets/changesets) for versioning.

## Project Structure

```
sdk-monorepo/
├── packages/
│   ├── core-sdk/          # @mycelium-ip/core-sdk
│   │   ├── src/
│   │   │   ├── client/    # MyceliumClient entry point
│   │   │   ├── programs/  # IpCore and License program clients
│   │   │   ├── pda/       # PDA derivation helpers
│   │   │   ├── wallet/    # Wallet Standard wrapper
│   │   │   ├── idl/       # Anchor IDLs (devnet, mainnet-beta)
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── tests/
│   └── react/             # @mycelium-ip/react
│       └── src/
│           ├── provider/  # MyceliumIpProvider
│           └── hooks/     # Entity, IP, License, Grant, Metadata, Derivative hooks
├── turbo.json
└── package.json
```

## License

[MIT](./LICENSE) — © 2026 Mycelium IP
