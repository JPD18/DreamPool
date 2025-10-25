import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBox } from '../components/ChatBox';
import { ProposedGoal } from '../types';
import { ApiService, ConversationState, ConversationResponse } from '../services/api';

export const ChatConcierge: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [proposedGoal, setProposedGoal] = useState<ProposedGoal | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
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
      let response: ConversationResponse;

      if (!conversationState) {
        // Start new conversation
        response = await ApiService.startConversation(message);
      } else {
        // Continue existing conversation
        response = await ApiService.continueConversation(conversationState, message);
      }

      // Update conversation state
      setConversationState({
        messages: response.messages,
        goal_description: response.goal_description,
        goal_amount_eth: response.goal_amount_eth,
        deadline_days: response.deadline_days,
        recipient_address: response.recipient_address,
        conversation_complete: response.conversation_complete,
        contract_payload: response.contract_payload
      });

      // Find the AI response (last AI message in the response)
      const aiMessages = response.messages.filter(msg => msg.type === 'AIMessage');
      const lastAiMessage = aiMessages[aiMessages.length - 1];

      if (lastAiMessage) {
        setMessages([...newMessages, { type: 'ai', content: lastAiMessage.content }]);
      }

      // If conversation is complete and we have a contract payload, create the goal
      if (response.conversation_complete && response.contract_payload) {
        const contractGoal: ProposedGoal = {
          title: response.goal_description || 'Dream Goal',
          cost_eth: response.goal_amount_eth || 1.0,
          deadline_days: response.deadline_days || 30,
          recipient: response.recipient_address || '0xcC31859af72EaFE13C843d4A5C5d3784B5615677',
          description: response.goal_description || ''
        };
        setProposedGoal(contractGoal);
      }

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
    <div className="min-h-screen bg-light">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Create Your Dream Goal
          </h1>
          <p className="text-gray-600 text-lg">
            Chat with our AI to turn your dreams into achievable funding goals
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white/70 border border-neon/20 rounded-lg p-6 mb-8">
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
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-black px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
            <h3 className="text-xl font-semibold text-black mb-4">
              Ready to Create Your Goal?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-gray-600">Title:</span>
                <div className="text-black font-medium">{proposedGoal.title}</div>
              </div>
              <div>
                <span className="text-gray-600">Cost:</span>
                <div className="text-black font-medium">{proposedGoal.cost_eth} ETH</div>
              </div>
              <div>
                <span className="text-gray-600">Deadline:</span>
                <div className="text-black font-medium">{proposedGoal.deadline_days} days</div>
              </div>
              <div>
                <span className="text-gray-600">Recipient:</span>
                <div className="text-black font-medium">
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
                  setConversationState(null);
                  setMessages([{ type: 'ai', content: "Let's try again. What do you want to own?" }]);
                }}
                className="px-6 py-3 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
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
