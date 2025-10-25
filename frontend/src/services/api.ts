import axios from 'axios';
import { ChatInput, ProposedGoal, EncodedTx } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiService {
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
