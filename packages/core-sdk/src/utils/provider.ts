import { AnchorProvider } from "@coral-xyz/anchor";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import type { WalletAdapterLike } from "../types";

export function createProvider(
  connection: Connection,
  wallet: WalletAdapterLike,
  confirmOptions?: ConfirmOptions,
): AnchorProvider {
  if (!wallet.publicKey) {
    throw new Error("wallet.publicKey is required");
  }

  const options = confirmOptions ?? AnchorProvider.defaultOptions();
  return new AnchorProvider(
    connection,
    {
      ...wallet,
      publicKey: wallet.publicKey,
    },
    options,
  );
}
