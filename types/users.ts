import { TokenData } from "@/lib/solana/fetchTokens";

export interface BaseAllocation {
    equities?: Record<string, number>;
    fixedIncome?: {
        bonds: number;
    } | number;
    bonds?: number;
    commodities?: Record<string, number>;
    cryptocurrencies?: Record<string, number>;
    cash?: number;
}

export interface AllocationData {
    asset: string;
    percentage: number;
    reasoning?: string;
}

export interface BaseMarketAnalysis {
    overview?: string;
    summary?: string;
    sectors?: {
        positive?: string[];
        negative?: string[];
        neutral?: string[];
        bestPerforming?: string;
        worstPerforming?: string;
    } | Record<string, number>;
    commodities?: {
        gold?: number;
        silver?: number;
    };
    indices?: {
        sp500?: number;
        nasdaq?: number;
        dowJones?: number;
    };
    currentPortfolio?: {
        totalValue: number;
        holdings: Record<string, number>;
    };
    fearAndGreedIndex?: string;
    fearGreedIndex?: string;
    marketData?: any;
}

export interface BaseInvestmentPlan {
    marketAnalysis?: BaseMarketAnalysis;
    portfolioRecommendation?: {
        diversification?: string;
        allocation?: BaseAllocation;
        strategy?: string;
    };
    investmentRecommendation?: {
        rationale?: string;
        allocationPlan?: BaseAllocation;
    };
    summary?: string;
    allocations?: Array<{
        asset: string;
        percentage: number;
        reasoning?: string;
    }>;
    riskLevel?: string;
}

export interface InvestmentPlanType {
    marketAnalysis?: BaseMarketAnalysis;
    portfolioRecommendation?: {
        diversification?: string;
        allocation?: BaseAllocation;
        strategy?: string;
    };
    investmentRecommendation?: {
        rationale?: string;
        allocationPlan?: BaseAllocation;
    };
    summary?: string;
    allocations?: AllocationData[];
    riskLevel?: string;
}

export interface Profile {
    username: string;
    walletAddress: string;
    holdings: TokenData[];
    totalValue: number;
    investmentPlan?: InvestmentPlanType;
}