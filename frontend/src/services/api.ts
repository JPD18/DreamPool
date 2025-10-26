import axios from 'axios';
import { ProposedGoal, EncodedTx } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// LangGraph conversation types
export interface ConversationState {
  messages: Array<{
    type: string;
    content: string;
    tool_calls?: any[];
    tool_call_id?: string;
    name?: string;
  }>;
  goal_description?: string;
  goal_amount_eth?: number;
  deadline_days?: number;
  recipient_address?: string;
  conversation_complete: boolean;
  contract_payload?: any;
}

export interface ConversationResponse {
  messages: Array<{
    type: string;
    content: string;
    tool_calls?: any[];
    tool_call_id?: string;
    name?: string;
  }>;
  goal_description?: string;
  goal_amount_eth?: number;
  deadline_days?: number;
  recipient_address?: string;
  conversation_complete: boolean;
  contract_payload?: any;
}

export class ApiService {
  // Legacy method for backward compatibility
  static async proposeGoal(message: string): Promise<ProposedGoal> {
    try {
      const response = await api.post<ProposedGoal>('/llm/propose', { message });
      return response.data;
    } catch (error) {
      console.error('Failed to propose goal:', error);
      throw new Error('Failed to parse your goal. Please try again.');
    }
  }

  static async buildTransaction(goal: ProposedGoal): Promise<EncodedTx> {
    try {
      const response = await api.post<EncodedTx>('/llm/build_tx', goal);
      return response.data;
    } catch (error) {
      console.error('Failed to build transaction:', error);
      throw new Error('Failed to prepare transaction. Please try again.');
    }
  }

  // New langgraph conversation methods
  static async startConversation(message: string): Promise<ConversationResponse> {
    try {
      const response = await api.post<ConversationResponse>('/llm/chat/start', { message });
      return response.data;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw new Error('Failed to start conversation. Please try again.');
    }
  }

  static async continueConversation(state: ConversationState, message: string): Promise<ConversationResponse> {
    try {
      const response = await api.post<ConversationResponse>('/llm/chat/continue', {
        state,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Failed to continue conversation:', error);
      throw new Error('Failed to continue conversation. Please try again.');
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}
