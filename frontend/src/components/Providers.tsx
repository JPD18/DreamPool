import React from "react";
import {
  AuthProvider,
  OpenfortProvider, 
  getDefaultConfig,
  RecoveryMethod,
} from "@openfort/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "wagmi";
import { baseSepolia, sepolia } from "viem/chains";
 
const config = createConfig(
  getDefaultConfig({
    appName: "Openfort Demo App",
    chains: [baseSepolia, sepolia], // add all the chains you want to support
    ssr: true,
  })
);
 
const queryClient = new QueryClient();
 
export function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_OPENFORT_PUBLISHABLE_KEY;
  
  // Check if publishable key is provided
  if (!publishableKey) {
    console.error(
      "OpenFort publishable key is missing. Please set VITE_OPENFORT_PUBLISHABLE_KEY in your environment variables.\n" +
      "1. Create a .env.local file in your frontend directory\n" +
      "2. Add: VITE_OPENFORT_PUBLISHABLE_KEY=your_key_here\n" +
      "3. Get your key from https://dashboard.openfort.io/"
    );
    
    // Return a fallback UI with instructions
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
          <p className="text-gray-700 mb-4">
            OpenFort publishable key is missing. Please follow these steps:
          </p>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your frontend directory</li>
            <li>Add: <code className="bg-gray-100 px-1 rounded">VITE_OPENFORT_PUBLISHABLE_KEY=your_key_here</code></li>
            <li>Get your key from <a href="https://dashboard.openfort.io/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">OpenFort Dashboard</a></li>
            <li>Restart your development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OpenfortProvider
          // Set the publishable key of your Openfort account. This field is required.
          publishableKey={publishableKey}
 
          // Set the wallet configuration.
        //   walletConfig={{
        //     shieldPublishableKey: "YOUR_OPENFORT_SHIELD_PUBLISHABLE_KEY",
        //     // If you want to use AUTOMATIC embedded wallet recovery, an encryption session is required.
        //     // Set this to your recovery endpoint URL from step "3. Set up the recovery endpoint" (e.g., "https://your-domain.com/api/shield-session").
        //     createEncryptedSessionEndpoint: "YOUR_OPENFORT_BACKEND_ENDPOINT",
        //   }}
 
          uiConfig={{
            authProviders: [
              AuthProvider.EMAIL,
              AuthProvider.GUEST,
              AuthProvider.GOOGLE,
              AuthProvider.WALLET,
              // Add your own authentication providers here...
              // More information in https://www.openfort.io/docs/products/embedded-wallet/react/auth
            ],
            walletRecovery: {
              defaultMethod: RecoveryMethod.AUTOMATIC, // or RecoveryMethod.PASSKEY or RecoveryMethod.PASSWORD
            },
          }}
        >
          {children}
        </OpenfortProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}