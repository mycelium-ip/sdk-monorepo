import type { Program } from "@coral-xyz/anchor";
import type { AnchorProvider } from "@coral-xyz/anchor";
import type {
  ConfirmOptions,
  SendOptions,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import type { TransactionResult } from "../types";
import { parseTransactionEvents } from "./events";

export async function sendInstruction<E>(
  provider: AnchorProvider,
  instruction: TransactionInstruction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  program: Program<any>,
  sendOptions?: SendOptions,
  confirmOptions?: ConfirmOptions,
): Promise<TransactionResult<E>> {
  const transaction = new Transaction().add(instruction);
  const signature = await provider.sendAndConfirm(transaction, [], {
    ...(confirmOptions ?? {}),
    ...(sendOptions ?? {}),
  });
  const events = await parseTransactionEvents(
    provider.connection,
    signature,
    program,
  );
  return { signature, event: events[0]?.data as E };
}
