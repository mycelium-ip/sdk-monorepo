import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import type { Wallet, WalletAccount } from "@wallet-standard/base";
import type {
  SolanaSignTransactionFeature,
  SolanaSignTransactionOutput,
} from "@solana/wallet-standard-features";

/**
 * Wraps a Solana `Keypair` into a Wallet Standard–compliant `Wallet`.
 *
 * This is used by the devnet integration tests so that `MyceliumClient`
 * (which expects a Wallet Standard wallet) can sign transactions with a
 * local filesystem keypair.
 */
export function createKeypairWallet(keypair: Keypair): Wallet {
  const account: WalletAccount = {
    address: keypair.publicKey.toBase58(),
    publicKey: keypair.publicKey.toBytes(),
    chains: ["solana:devnet"],
    features: ["solana:signTransaction"],
  };

  const signTransaction: SolanaSignTransactionFeature["solana:signTransaction"]["signTransaction"] =
    async (...inputs) => {
      const outputs: SolanaSignTransactionOutput[] = [];

      for (const input of inputs) {
        const txBytes = input.transaction;
        let signed: Uint8Array;

        // Try legacy Transaction first, fall back to VersionedTransaction
        try {
          const tx = Transaction.from(Buffer.from(txBytes));
          tx.partialSign(keypair);
          signed = new Uint8Array(
            tx.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            }),
          );
        } catch {
          const vtx = VersionedTransaction.deserialize(Buffer.from(txBytes));
          vtx.sign([keypair]);
          signed = new Uint8Array(vtx.serialize());
        }

        outputs.push({ signedTransaction: signed });
      }

      return outputs;
    };

  return {
    version: "1.0.0" as const,
    name: "Keypair Wallet",
    icon: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" as `data:image/${"svg+xml" | "webp" | "png" | "gif"};base64,${string}`,
    chains: ["solana:devnet"],
    accounts: [account],
    features: {
      "solana:signTransaction": {
        version: "1.0.0" as const,
        supportedTransactionVersions: ["legacy" as const, 0 as const],
        signTransaction,
      },
    },
  };
}
