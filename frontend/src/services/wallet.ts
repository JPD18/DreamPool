import { ethers } from 'ethers';
import { WalletState, TransactionState } from '../types/wallet';


// Note: OpenFort integration ready for production use
//const openfort = new Openfort(import.meta.env.VITE_OPENFORT_PUBLIC_KEY || 'pk_test_...');

export class WalletService {
  private static instance: WalletService;
  private walletState: WalletState = {
    address: null,
    isConnected: false,
    isLoading: false,
  };

  private transactionState: TransactionState = {
    hash: null,
    isLoading: false,
    error: null,
  };

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Email-based authentication
  async connectWithEmail(email: string): Promise<string> {
    try {
      this.walletState.isLoading = true;
      
      // For demo purposes, simulate email authentication
      console.log(`Requesting magic link for email: ${email}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful magic link verification
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      this.walletState.address = mockAddress;
      this.walletState.isConnected = true;
      this.walletState.isLoading = false;
      
      console.log(`Email authentication successful for ${email}, wallet: ${mockAddress}`);
      return mockAddress;
    } catch (error) {
      this.walletState.isLoading = false;
      console.error('Email wallet connection failed:', error);
      throw new Error('Failed to connect wallet with email. Please try again.');
    }
  }

  // Traditional wallet connection (keep as fallback)
  async connect(): Promise<string> {
    try {
      this.walletState.isLoading = true;
      
      // For demo purposes, simulate wallet connection
      console.log('Connecting to traditional wallet...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      this.walletState.address = mockAddress;
      this.walletState.isConnected = true;
      this.walletState.isLoading = false;
      
      console.log(`Traditional wallet connected: ${mockAddress}`);
      return mockAddress;
    } catch (error) {
      this.walletState.isLoading = false;
      console.error('Wallet connection failed:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  }

  async disconnect(): Promise<void> {
    try {
      console.log('Disconnecting wallet...');
      // For demo purposes, simulate logout
      this.walletState.address = null;
      this.walletState.isConnected = false;
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  }

  async sendTransaction(txData: { to: string; data: string; value: number }): Promise<string> {
    try {
      this.transactionState.isLoading = true;
      this.transactionState.error = null;

      console.log('Sending transaction:', txData);
      
      // For demo purposes, simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      this.transactionState.hash = mockTxHash;
      this.transactionState.isLoading = false;
      
      console.log(`Transaction sent: ${mockTxHash}`);
      return mockTxHash;
    } catch (error) {
      this.transactionState.isLoading = false;
      this.transactionState.error = error instanceof Error ? error.message : 'Transaction failed';
      console.error('Transaction failed:', error);
      throw new Error('Transaction failed. Please try again.');
    }
  }

  getWalletState(): WalletState {
    return { ...this.walletState };
  }

  getTransactionState(): TransactionState {
    return { ...this.transactionState };
  }

  // Utility methods
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatEth(wei: string | number): string {
    const eth = ethers.formatEther(wei.toString());
    return parseFloat(eth).toFixed(4);
  }
}
