import { useWallets } from "@openfort/react";

export function useWalletCreation() {
  const {
    isCreating,
    createWallet,
  } = useWallets();

  const handleCreateWallet = async () => {
    try {
      const newWallet = await createWallet();
      console.log("New wallet created:", newWallet);
      return newWallet;
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw error;
    }
  };

  return {
    isCreating,
    createWallet: handleCreateWallet,
  };
}
