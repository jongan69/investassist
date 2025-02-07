import { Profile, InvestmentPlanType } from "@/types/users"

export async function saveInvestmentPlan(username: string, investmentPlan: InvestmentPlanType) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    try {
        const response = await fetch(`${baseUrl}/api/save-investment-plan`, {
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