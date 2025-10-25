import React, { useState } from 'react';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "What do you want to own?" 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white/70 border border-neon/30 rounded-lg text-black placeholder-gray-600 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon/20 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
};
