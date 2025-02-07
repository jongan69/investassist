import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestmentPlanType } from '@/types/users';

interface AnalysisCardProps {
    investmentPlan: InvestmentPlanType;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ investmentPlan }) => (
    <Card>
        <CardContent className="p-6 space-y-4">
            <p className="text-lg leading-relaxed">
                {investmentPlan?.marketAnalysis?.overview ?? 'No market analysis available'}
            </p>
            <div className="flex items-center gap-2">
                <Badge className="bg-pink-500">Risk Level</Badge>
                <span className="text-pink-500 font-semibold">{investmentPlan.riskLevel}</span>
            </div>
        </CardContent>
    </Card>
); 