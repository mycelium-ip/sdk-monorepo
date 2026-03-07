import type { AnchorProvider } from "@coral-xyz/anchor";
import type {
  ConfirmOptions,
  SendOptions,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";

export async function sendInstruction(
  provider: AnchorProvider,
  instruction: TransactionInstruction,
  sendOptions?: SendOptions,
  confirmOptions?: ConfirmOptions,
): Promise<string> {
  const transaction = new Transaction().add(instruction);
  return provider.sendAndConfirm(transaction, [], {
    ...(confirmOptions ?? {}),
    ...(sendOptions ?? {}),
  });
}
