import { InvestmentPlan } from '@/types/investment-plan';
import { InvestmentPlanType } from '@/types/users';

/**
 * Checks if an investment plan is currently being generated
 * @param plan The investment plan to check
 * @returns True if the plan is being generated, false otherwise
 */
export function isGeneratingPlan(plan: InvestmentPlan | null): boolean {
  if (!plan) return false;
  return plan.status === 'generating';
}

/**
 * Generates a new investment plan for a user
 * @param userId The ID of the user to generate the plan for
 * @param riskProfile The user's risk profile
 * @param timeHorizon The user's investment time horizon
 * @param investmentGoal The user's investment goal
 * @returns The newly created investment plan
 */
export async function generateInvestmentPlan(
  userId: string,
  riskProfile: string,
  timeHorizon: string,
  investmentGoal: string
): Promise<InvestmentPlan> {
  // In a real application, this would make an API call to generate the plan
  // For now, we'll return a mock plan in the 'generating' state
  return {
    id: '1',
    status: 'generating',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    riskProfile,
    timeHorizon,
    investmentGoal,
    allocations: [],
    recommendations: [],
  };
} 