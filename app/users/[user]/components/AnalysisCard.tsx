import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BaseInvestmentPlan } from "@/types/users";

interface AnalysisCardProps {
    plan: BaseInvestmentPlan | undefined;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ plan }) => {
    if (!plan) return null;

    const marketAnalysis = plan.marketAnalysis || {};
    const portfolioRec = plan.portfolioRecommendation || {};
    const investmentRec = plan.investmentRecommendation || {};

    const diversification = portfolioRec.diversification;
    const strategy = portfolioRec.strategy || investmentRec.rationale;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Investment Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-medium mb-2">Market Overview</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {marketAnalysis.overview || marketAnalysis.summary || plan.summary}
                    </p>
                </div>

                {marketAnalysis.sectors && (
                    <div>
                        <h3 className="font-medium mb-2">Sector Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(marketAnalysis.sectors).map(([sector, performance]) => (
                                <div key={sector} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <span className="font-medium">{sector}: </span>
                                    <span className={typeof performance === 'number' && performance > 0 ? 'text-green-500' : 'text-red-500'}>
                                        {typeof performance === 'number' ? `${performance.toFixed(2)}%` : performance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(diversification || strategy) && (
                    <div>
                        <h3 className="font-medium mb-2">Recommendations</h3>
                        {diversification && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {diversification}
                            </p>
                        )}
                        {strategy && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {strategy}
                            </p>
                        )}
                    </div>
                )}

                {plan.riskLevel && (
                    <div>
                        <h3 className="font-medium mb-2">Risk Level</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.riskLevel}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 