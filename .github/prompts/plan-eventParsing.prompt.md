# Plan: Strongly-Typed Event Parsing Across SDK Layers

The SDK will surface program events (18 total across `ip_core` and `license`) as strongly-typed return values from both core SDK sender methods and React mutation hooks. This requires changes at three levels: new event types + parsing utility in core-sdk, updated sender return types (breaking), and auto-parsing in React hooks. The extra cost is one `getTransaction` RPC call per send to fetch logs for parsing.

**Steps**

## Phase 1 — Core SDK Event Types

1. Create `packages/core-sdk/src/types/events.ts` defining TypeScript interfaces for all 18 events. Each mirrors the Rust struct fields with TS-appropriate types (`PublicKey` for `Pubkey`, `number` for `u8`/`u64`, `bigint` for `i64`, `Uint8Array` or `number[]` for `[u8; N]`):
   - **ip_core events (13):** `ConfigInitialized`, `ConfigUpdated`, `TreasuryInitialized`, `TreasuryWithdrawal`, `EntityCreated`, `EntityControllersUpdated`, `MetadataSchemaCreated`, `EntityMetadataCreated`, `IpMetadataCreated`, `IpCreated`, `IpTransferred`, `DerivativeLinkCreated`, `DerivativeLicenseUpdated`
   - **license events (5):** `LicenseCreated`, `LicenseUpdated`, `LicenseRevoked`, `LicenseGrantCreated`, `LicenseGrantRevoked`
   - Export a `IpCoreEvent` union and `LicenseEvent` union for convenience

2. Export events from `packages/core-sdk/src/types/index.ts` via `export * from "./events"`

## Phase 2 — Event Parsing Utility

3. Create `packages/core-sdk/src/utils/events.ts` with:
   - `parseTransactionEvents<E>(connection: Connection, signature: string, program: Program): Promise<E[]>` — fetches the confirmed transaction via `connection.getTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 })`, extracts log messages, runs them through Anchor's `EventParser(program.programId, program.coder)`, and returns the decoded events cast to `E[]`
   - Handle edge cases: transaction not found (retry once after short delay since confirmation just succeeded), no logs, no matching events

4. Export the utility from `packages/core-sdk/src/index.ts` — `export * from "./utils/events"` so consumers doing manual `*Ix()` flows can parse events independently

## Phase 3 — Core SDK Sender Return Type (Breaking Change)

5. Add a `TransactionResult<E>` type to `packages/core-sdk/src/types/index.ts`:

   ```ts
   TransactionResult<E> = { signature: string; event: E }
   ```

6. Update `sendInstruction` in `packages/core-sdk/src/utils/transactions.ts`:
   - New signature: `sendInstruction<E>(provider, instruction, program, sendOptions?, confirmOptions?): Promise<TransactionResult<E>>`
   - After `provider.sendAndConfirm()`, call `parseTransactionEvents<E>(provider.connection, signature, program)`, take the first event, and return `{ signature, event }`

7. Update **every sender method** across all modules to pass `this.client.program` to `sendInstruction` and use the correct event generic. Each method's return type changes from `Promise<string>` to `Promise<TransactionResult<SpecificEvent>>`:

   | Module file     | Method                 | Event type                 |
   | --------------- | ---------------------- | -------------------------- |
   | `entity.ts`     | `create`               | `EntityCreated`            |
   | `entity.ts`     | `updateControllers`    | `EntityControllersUpdated` |
   | `ip.ts`         | `create`               | `IpCreated`                |
   | `ip.ts`         | `transfer`             | `IpTransferred`            |
   | `metadata.ts`   | `createSchema`         | `MetadataSchemaCreated`    |
   | `metadata.ts`   | `createEntityMetadata` | `EntityMetadataCreated`    |
   | `metadata.ts`   | `createIpMetadata`     | `IpMetadataCreated`        |
   | `derivative.ts` | `createLink`           | `DerivativeLinkCreated`    |
   | `derivative.ts` | `updateLicense`        | `DerivativeLicenseUpdated` |
   | `license.ts`    | `create`               | `LicenseCreated`           |
   | `license.ts`    | `update`               | `LicenseUpdated`           |
   | `license.ts`    | `revoke`               | `LicenseRevoked`           |
   | `grant.ts`      | `create`               | `LicenseGrantCreated`      |
   | `grant.ts`      | `revoke`               | `LicenseGrantRevoked`      |

## Phase 4 — React Package Event Integration

8. Make `TransactionResult` generic in `packages/react/src/utils/transaction.ts`:

   ```ts
   TransactionResult<E = void> = { signature: string; event?: E }
   ```

   (Using `event?: E` keeps backward compat for `executeTransactionWithInstructions` where event type mapping is ambiguous)

9. Update `executeTransaction` signature in `packages/react/src/utils/transaction.ts`:
   - Add an optional `eventParser` callback parameter: `eventParser?: (connection: Connection, signature: string) => Promise<E>`
   - After confirmation, if `eventParser` is provided, call it and attach the result as `event` on the return value
   - Return type becomes `Promise<TransactionResult<E>>`

10. Add a `parseEvent` method to both `IpCoreClient` and `LicenseClient` in `packages/core-sdk/src/programs/ipCore/IpCoreClient.ts` and `packages/core-sdk/src/programs/license/LicenseClient.ts`:
    - `parseEvent<E>(connection: Connection, signature: string): Promise<E>` — delegates to the `parseTransactionEvents` utility using `this.program`, returns the first matching event
    - This gives React hooks a clean way to pass the parser without importing Anchor directly

11. Update **every React mutation hook** to:
    - Add the event generic to `useMutation<TransactionResult<SpecificEvent>, Error, Params>`
    - Pass an `eventParser` lambda to `executeTransaction` that calls `client.ipCore.parseEvent<SpecificEvent>(connection, signature)` (or `client.license.parseEvent<...>` for license hooks)
    - The `data` result from the mutation now includes `event` for consumers

    Affected hooks (14 total):
    - `useCreateEntity.ts`, `useUpdateEntityControllers.ts`
    - `useCreateIp.ts`, `useTransferIp.ts`
    - `useCreateMetadataSchema.ts`, `useCreateEntityMetadata.ts`, `useCreateIpMetadata.ts`
    - `useCreateDerivativeLink.ts`, `useUpdateDerivativeLicense.ts`
    - `useCreateLicense.ts`, `useUpdateLicense.ts`, `useRevokeLicense.ts`
    - `useCreateLicenseGrant.ts`, `useRevokeLicenseGrant.ts`

## Phase 5 — Exports & Tests

12. Export all new event types from `packages/core-sdk/src/index.ts` (already covered by `export * from "./types"` and adding `export * from "./utils/events"`)

13. Re-export event types from `packages/react/src/index.ts` for convenience: `export type { EntityCreated, IpCreated, ... } from "@mycelium-ip/core-sdk"`

14. Update core SDK tests in `packages/core-sdk/src/client/MyceliumClient.test.ts` — sender methods now return `{ signature, event }` instead of bare string

15. Update React tests in `packages/react/src/test/hooks.test.tsx`:
    - Mock `connection.getTransaction` to return fake log messages
    - Assert that mutation `data` includes the parsed event
    - Update `packages/react/src/test/mocks.ts` with log fixture data containing base64-encoded events

## Verification

- `pnpm build` passes in both packages (TypeScript compilation)
- Core SDK tests verify `sendInstruction` returns `{ signature, event }` with correct typing
- React tests verify hooks return `TransactionResult<SpecificEvent>` with populated `event`
- Manual test: call `useCreateEntity().mutate(...)`, inspect `data.event` in the browser to see `EntityCreated` fields

## Decisions

- **Breaking change accepted**: Core SDK sender return type changes from `string` to `TransactionResult<E>` — requires a major version bump
- **One extra RPC call per send**: `getTransaction` is called after every `sendAndConfirm` to fetch logs for parsing — this is the cost of always-on event parsing
- **`parseEvent` on client classes**: Rather than making React depend on `@coral-xyz/anchor`, the client classes expose a `parseEvent` method that React hooks use as a callback — keeps the React package Anchor-free
- **Event types hand-written (not generated)**: The IDL has full event schemas, but hand-written interfaces give better DX with doc comments and correct TS types for Solana-specific values like `PublicKey`
