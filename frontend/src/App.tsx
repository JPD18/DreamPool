import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { ChatConcierge } from './pages/ChatConcierge';
import { CreateGoal } from './pages/CreateGoal';
import { GoalDashboard } from './pages/GoalDashboard';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Simple placeholder wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    // Placeholder connect - simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    setWalletAddress('0x1234567890123456789012345678901234567890');
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-dark">
          {/* Development Notice */}
          <div className="bg-yellow-600 text-black text-center py-2 px-4 text-sm font-medium">
            🔧 Development Mode: All wallet and blockchain features are simulated for demo purposes
          </div>
          
          <Navbar
            walletAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatConcierge />} />
            <Route path="/create-goal" element={<CreateGoal />} />
            <Route path="/dashboard" element={<GoalDashboard />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
