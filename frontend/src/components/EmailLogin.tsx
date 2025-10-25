import React, { useState, useEffect } from 'react';
import { useEmailAuth } from "@openfort/react";

interface EmailLoginProps {
  onEmailConnect: (email: string) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export const EmailLogin: React.FC<EmailLoginProps> = ({ onEmailConnect, isLoading, onClose }) => {
  const { signInEmail, signUpEmail, isLoading: authLoading, isSuccess, error: authError } = useEmailAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null);

  // Listen for authentication success
  useEffect(() => {
    if (isSuccess && email) {
      console.log('Authentication successful for:', email);
      setAuthenticatedUser(email);
      // Call onEmailConnect when user is authenticated
      onEmailConnect(email).catch(console.error);
    }
  }, [isSuccess, email, onEmailConnect]);

  // Listen for authentication errors
  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      setError(authError.message || 'Authentication failed');
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    try {
      console.log('Attempting authentication for:', email, 'isSignUp:', isSignUp);
      const result = isSignUp 
        ? await signUpEmail({ email, password })
        : await signInEmail({ email, password });

      console.log('Authentication result:', result);

      if (result.requiresEmailVerification) {
        setSuccess('Please check your inbox for a verification code. After verification, you will be automatically signed in.');
      } else {
        // Authentication successful - the useEffect will handle updating the state
        setSuccess('Authentication successful!');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleLogout = () => {
    // Clear local state
    setAuthenticatedUser(null);
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setIsSignUp(false);
  };

  // If user is authenticated, show their email instead of the form
  if (authenticatedUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            ×
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome!</h2>
            <p className="text-gray-600 mb-6">You are signed in as:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-lg font-medium text-gray-800">{authenticatedUser}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
          disabled={isLoading}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          {isSignUp ? 'Sign Up' : 'Sign In'} with Email
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
              disabled={isLoading || authLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              disabled={isLoading || authLoading}
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">{error}</div>
          )}
          
          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">{success}</div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || authLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
            disabled={isLoading || authLoading}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Secure email authentication powered by OpenFort</p>
          <p className="mt-1">No browser extension required!</p>
        </div>
      </div>
    </div>
  );
};
