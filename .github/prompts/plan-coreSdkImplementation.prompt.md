## Plan: Core SDK v1 foundation (DRAFT)

This plan builds `@mycelium-ip/core-sdk` from scaffold to a usable v1 with app-facing flows only (no admin/treasury methods), using vendored IDLs in the SDK package and ergonomic string-first inputs converted internally to protocol byte formats. It aligns the architecture spec to the monorepo layout (`packages/core-sdk` instead of `sdk/`), keeps PDA/account resolution internal, and preserves future extensibility for additional programs. It also fixes workspace package-name consistency so `react` compiles against the canonical package name you selected.

**Steps**

1. Establish package and layout baseline in [packages/core-sdk/package.json](packages/core-sdk/package.json), [packages/core-sdk/tsconfig.json](packages/core-sdk/tsconfig.json), [packages/core-sdk/tsconfig.build.json](packages/core-sdk/tsconfig.build.json), and align consumer import in [packages/react/package.json](packages/react/package.json) to `@mycelium-ip/core-sdk`.
2. Vendor protocol IDLs into [packages/core-sdk/idl/ip_core.json](packages/core-sdk/idl/ip_core.json) and [packages/core-sdk/idl/license.json](packages/core-sdk/idl/license.json), sourced from [../mycelium-ip-protocol/target/idl/ip_core.json](../mycelium-ip-protocol/target/idl/ip_core.json) and [../mycelium-ip-protocol/target/idl/license.json](../mycelium-ip-protocol/target/idl/license.json).
3. Implement core client bootstrap in [packages/core-sdk/src/client/MyceliumClient.ts](packages/core-sdk/src/client/MyceliumClient.ts) with `MyceliumClient`, wallet-adapter-compatible options, provider creation, and program client initialization; export via [packages/core-sdk/src/index.ts](packages/core-sdk/src/index.ts).
4. Add constants/types/utilities in [packages/core-sdk/src/constants/programs.ts](packages/core-sdk/src/constants/programs.ts), [packages/core-sdk/src/types/index.ts](packages/core-sdk/src/types/index.ts), [packages/core-sdk/src/utils/provider.ts](packages/core-sdk/src/utils/provider.ts), and [packages/core-sdk/src/utils/transactions.ts](packages/core-sdk/src/utils/transactions.ts) for shared program IDs, input/output contracts, and send helpers.
5. Build PDA derivation layer in [packages/core-sdk/src/pda](packages/core-sdk/src/pda) for entity/IP/metadata/license/derivative/license-grant derivations; all modules consume these helpers instead of deriving inline.
6. Implement `ipCore` program client + modules in [packages/core-sdk/src/programs/ipCore/IpCoreClient.ts](packages/core-sdk/src/programs/ipCore/IpCoreClient.ts), [packages/core-sdk/src/programs/ipCore/entity.ts](packages/core-sdk/src/programs/ipCore/entity.ts), [packages/core-sdk/src/programs/ipCore/ip.ts](packages/core-sdk/src/programs/ipCore/ip.ts), [packages/core-sdk/src/programs/ipCore/metadata.ts](packages/core-sdk/src/programs/ipCore/metadata.ts), [packages/core-sdk/src/programs/ipCore/derivative.ts](packages/core-sdk/src/programs/ipCore/derivative.ts) exposing paired `createIx`/`create` (plus update/transfer methods where relevant).
7. Implement `license` program client + modules in [packages/core-sdk/src/programs/license/LicenseClient.ts](packages/core-sdk/src/programs/license/LicenseClient.ts), [packages/core-sdk/src/programs/license/license.ts](packages/core-sdk/src/programs/license/license.ts), [packages/core-sdk/src/programs/license/grant.ts](packages/core-sdk/src/programs/license/grant.ts) for create/update/revoke license and create/revoke grant flows.
8. Add ergonomic conversion utilities (string → fixed byte arrays) and apply across module parameter parsing, ensuring surfaced APIs avoid PDA/bump/internal account inputs while preserving Anchor error propagation.

**Verification**

- Run `pnpm --filter @mycelium-ip/core-sdk typecheck` and `pnpm --filter @mycelium-ip/core-sdk build`.
- Run workspace checks `pnpm typecheck` and `pnpm build` from repo root.
- Add/execute minimal unit tests for deterministic conversions + PDA derivation helpers via `pnpm --filter @mycelium-ip/core-sdk test`.
- Manual API smoke: instantiate `MyceliumClient` with a wallet-adapter-compatible mock and assert module availability + instruction object creation for one method per module.

**Decisions**

- Scope: app-facing flows only for v1 (exclude config/treasury admin ops).
- IDLs: vendored in `packages/core-sdk/idl`.
- API inputs: ergonomic strings with internal conversion.
- Package canonical name: `@mycelium-ip/core-sdk`.
