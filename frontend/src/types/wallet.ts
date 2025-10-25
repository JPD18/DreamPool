export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

export interface TransactionState {
  hash: string | null;
  isLoading: boolean;
  error: string | null;
}
