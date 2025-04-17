import { InvestmentPlanType } from "@/types/users"

export async function saveInvestmentPlan(username: string, investmentPlan: InvestmentPlanType) {
    try {
        const response = await fetch(`/api/save-investment-plan`, {
            method: 'POST',
            body: JSON.stringify({ username, investmentPlan })
        })

        if (!response.ok) {
            throw new Error(`Failed to save investment plan: ${response.statusText}`);
        }

        return response.json()
    } catch (error) {
        console.error('Error saving investment plan:', error);
        throw error;
    }
}