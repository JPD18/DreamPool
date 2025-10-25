// API Types
export interface ChatInput {
  message: string;
}

export interface ProposedGoal {
  title: string;
  cost_eth: number;
  deadline_days: number;
  recipient: string;
  description?: string;
}

export interface EncodedTx {
  to: string;
  data: string;
  value: number;
}

export interface PoolData {
  pool_id: number;
  recipient: string;
  creator: string;
  goal_amount: number; // in wei
  deadline: number; // timestamp
  raised_amount: number; // in wei
  status: 'active' | 'completed' | 'expired';
  title: string;
  description: string;
  finalized: boolean;
  failed: boolean;
}

// UI Types
export interface GoalSummary {
  title: string;
  cost_eth: number;
  deadline_days: number;
  recipient: string;
  description?: string;
}
