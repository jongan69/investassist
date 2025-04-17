export interface AllocationData {
  tokenAddress: string;
  symbol: string;
  name: string;
  targetAllocation: number;
  currentAllocation: number;
  difference: number;
}

export interface RecommendationData {
  type: 'buy' | 'sell';
  tokenAddress: string;
  symbol: string;
  name: string;
  amount: number;
  value: number;
  reason: string;
}

export interface InvestmentPlan {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  riskProfile: string;
  timeHorizon: string;
  investmentGoal: string;
  allocations: AllocationData[];
  recommendations: RecommendationData[];
} 