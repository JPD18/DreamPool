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

export interface EmailAuthState {
  email: string | null;
  isEmailAuth: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface WalletConnectionOptions {
  email?: string;
  chainId?: number;
  policyId?: string;
}
