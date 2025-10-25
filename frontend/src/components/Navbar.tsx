import React from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ walletAddress, onConnect, onDisconnect }) => {
  // Simple placeholder function to format address
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-dark border-b border-neon/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-neon to-magenta rounded-lg flex items-center justify-center">
              <span className="text-dark font-bold text-sm">DP</span>
            </div>
            <span className="text-xl font-bold text-neon">DreamPool</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/chat" 
              className="text-gray-300 hover:text-neon transition-colors"
            >
              Create Goal
            </Link>
            <Link 
              to="/dashboard" 
              className="text-gray-300 hover:text-neon transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {walletAddress ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-300">
                  {formatAddress(walletAddress)}
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1 text-sm bg-magenta/20 text-magenta border border-magenta/30 rounded-md hover:bg-magenta/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="px-4 py-2 bg-neon/20 text-neon border border-neon/30 rounded-md hover:bg-neon/30 transition-colors font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
