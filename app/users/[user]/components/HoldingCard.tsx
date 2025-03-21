import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { TokenData } from "@/lib/solana/fetchTokens";

interface HoldingCardProps {
    token: TokenData;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({ token }) => {
    return (
        <Card>
            <CardContent className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3">
                    <div className="font-medium">{token.symbol}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {token.amount.toFixed(2)} {token.symbol}
                    </div>
                    <div className="font-medium">${token.usdValue.toFixed(2)}</div>
                </div>
            </CardContent>
        </Card>
    );
}; 