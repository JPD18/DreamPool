// import { Openfort } from '@openfort/openfort-js';
// import { ethers } from 'ethers';
// import { WalletState, TransactionState } from '../types/wallet';

// // Initialize Openfort
// const openfort = new Openfort(import.meta.env.VITE_OPENFORT_PUBLIC_KEY || 'pk_test_...');

// export class WalletService {
//   private static instance: WalletService;
//   private walletState: WalletState = {
//     address: null,
//     isConnected: false,
//     isLoading: false,
//   };

//   private transactionState: TransactionState = {
//     hash: null,
//     isLoading: false,
//     error: null,
//   };

//   private constructor() {}

//   static getInstance(): WalletService {
//     if (!WalletService.instance) {
//       WalletService.instance = new WalletService();
//     }
//     return WalletService.instance;
//   }

//   async connect(): Promise<string> {
//     try {
//       this.walletState.isLoading = true;
      
//       // Connect to Openfort
//       const session = await openfort.connect();
      
//       if (session && session.address) {
//         this.walletState.address = session.address;
//         this.walletState.isConnected = true;
//         this.walletState.isLoading = false;
//         return session.address;
//       }
      
//       throw new Error('Failed to connect wallet');
//     } catch (error) {
//       this.walletState.isLoading = false;
//       console.error('Wallet connection failed:', error);
//       throw new Error('Failed to connect wallet. Please try again.');
//     }
//   }

//   async disconnect(): Promise<void> {
//     try {
//       await openfort.logout();
//       this.walletState.address = null;
//       this.walletState.isConnected = false;
//     } catch (error) {
//       console.error('Wallet disconnection failed:', error);
//     }
//   }

//   async sendTransaction(txData: { to: string; data: string; value: number }): Promise<string> {
//     try {
//       this.transactionState.isLoading = true;
//       this.transactionState.error = null;

//       // Send transaction via Openfort
//       const txHash = await openfort.sendTransaction({
//         to: txData.to,
//         data: txData.data,
//         value: txData.value.toString(),
//       });

//       this.transactionState.hash = txHash;
//       this.transactionState.isLoading = false;
      
//       return txHash;
//     } catch (error) {
//       this.transactionState.isLoading = false;
//       this.transactionState.error = error instanceof Error ? error.message : 'Transaction failed';
//       console.error('Transaction failed:', error);
//       throw new Error('Transaction failed. Please try again.');
//     }
//   }

//   getWalletState(): WalletState {
//     return { ...this.walletState };
//   }

//   getTransactionState(): TransactionState {
//     return { ...this.transactionState };
//   }

//   // Utility methods
//   formatAddress(address: string): string {
//     if (!address) return '';
//     return `${address.slice(0, 6)}...${address.slice(-4)}`;
//   }

//   formatEth(wei: string | number): string {
//     const eth = ethers.formatEther(wei.toString());
//     return parseFloat(eth).toFixed(4);
//   }
// }
