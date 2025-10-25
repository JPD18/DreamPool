import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBox } from '../components/ChatBox';
import { ProposedGoal } from '../types';

export const ChatConcierge: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [proposedGoal, setProposedGoal] = useState<ProposedGoal | null>(null);
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([
    { type: 'ai', content: "Hi! I'm your AI concierge. What do you want to own? I can help you create a funding goal to make it happen!" }
  ]);
  const navigate = useNavigate();

  const handleSendMessage = async (message: string) => {
    // Add user message
    const newMessages = [...messages, { type: 'user' as const, content: message }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Simulate AI response (placeholder)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      
      // Create a mock goal based on the message
      const mockGoal: ProposedGoal = {
        title: `Goal: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        cost_eth: Math.floor(Math.random() * 5) + 1, // Random 1-5 ETH
        deadline_days: Math.floor(Math.random() * 30) + 7, // Random 7-37 days
        recipient: '0x0000000000000000000000000000000000000000', // User's wallet
        description: `This is a demo goal created from: "${message}"`
      };
      
      setProposedGoal(mockGoal);
      
      // Add AI response
      const aiResponse = `Great! I can help you set up a funding goal for "${mockGoal.title}". Here's what I found:

💰 **Cost**: ${mockGoal.cost_eth} ETH
⏰ **Deadline**: ${mockGoal.deadline_days} days
👤 **Recipient**: Your wallet
📝 **Description**: ${mockGoal.description}

Ready to create this goal? (Demo mode)`;

      setMessages([...newMessages, { type: 'ai', content: aiResponse }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your request';
      setMessages([...newMessages, { type: 'ai', content: `Sorry, ${errorMessage}. Please try again with a clearer description.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmGoal = () => {
    if (proposedGoal) {
      navigate('/create-goal', { state: { goal: proposedGoal } });
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Create Your Dream Goal
          </h1>
          <p className="text-gray-400 text-lg">
            Chat with our AI to turn your dreams into achievable funding goals
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-dark/50 border border-neon/20 rounded-lg p-6 mb-8">
          {/* Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-neon text-dark'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatBox
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Describe what you want to own or achieve..."
          />
        </div>

        {/* Goal Confirmation */}
        {proposedGoal && (
          <div className="bg-gradient-to-r from-neon/10 to-magenta/10 border border-neon/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Ready to Create Your Goal?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-400">Title:</span>
                <div className="text-white font-medium">{proposedGoal.title}</div>
              </div>
              <div>
                <span className="text-gray-400">Cost:</span>
                <div className="text-white font-medium">{proposedGoal.cost_eth} ETH</div>
              </div>
              <div>
                <span className="text-gray-400">Deadline:</span>
                <div className="text-white font-medium">{proposedGoal.deadline_days} days</div>
              </div>
              <div>
                <span className="text-gray-400">Recipient:</span>
                <div className="text-white font-medium">
                  {proposedGoal.recipient === '0x0000000000000000000000000000000000000000' 
                    ? 'Your wallet' 
                    : proposedGoal.recipient}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmGoal}
                className="px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 transition-colors"
              >
                Create Goal
              </button>
              <button
                onClick={() => {
                  setProposedGoal(null);
                  setMessages([...messages, { type: 'ai', content: "Let's try again. What do you want to own?" }]);
                }}
                className="px-6 py-3 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
