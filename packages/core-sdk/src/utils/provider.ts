import { AnchorProvider } from "@coral-xyz/anchor";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import type { StandardWalletWrapper } from "../wallet";

export function createProvider(
  connection: Connection,
  wallet: StandardWalletWrapper,
  confirmOptions?: ConfirmOptions,
): AnchorProvider {
  const options = confirmOptions ?? AnchorProvider.defaultOptions();
  return new AnchorProvider(connection, wallet, options);
}
