import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChatConcierge } from './pages/ChatConcierge';
import { CreateGoal } from './pages/CreateGoal';
import { GoalDashboard } from './pages/GoalDashboard';
import { ViewPools } from './pages/ViewPools';
import { WalletService } from './services/wallet';
import { Providers } from './components/Providers';
import './App.css';


function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const walletService = WalletService.getInstance();
      const address = await walletService.connect();
      setWalletAddress(address);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailConnect = async (email: string) => {
    setIsLoading(true);
    try {
      const walletService = WalletService.getInstance();
      const address = await walletService.connectWithEmail(email);
      setWalletAddress(address);
    } catch (error) {
      console.error('Email connection failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const walletService = WalletService.getInstance();
      await walletService.disconnect();
      setWalletAddress(null);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  return (
    <Providers>
      <Router>
        <div className="min-h-screen bg-light">
          {/* Development Notice */}
          <div className="bg-yellow-600 text-black text-center py-2 px-4 text-sm font-medium">
            🔧 Development Mode: All wallet and blockchain features are simulated for demo purposes
          </div>
          
          <Navbar
            walletAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onEmailConnect={handleEmailConnect}
            isLoading={isLoading}
          />
          
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatConcierge />} />
            <Route path="/create-goal" element={<CreateGoal />} />
            <Route path="/dashboard" element={<GoalDashboard />} />
            <Route path="/pools" element={<ViewPools />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </div>
      </Router>
    </Providers>
  );
}

export default App;
