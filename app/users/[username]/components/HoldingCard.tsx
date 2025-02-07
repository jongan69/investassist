import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';
import { TokenData } from "@/lib/solana/fetchTokens";

interface HoldingCardProps {
    token: TokenData;
    index: number;
}

export const HoldingCard: React.FC<HoldingCardProps> = ({ token, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <Card className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {token.logo && (
                        <Image 
                            src={token.logo} 
                            alt={token.symbol} 
                            className="w-10 h-10 rounded-full"
                            width={40}
                            height={40}
                        />
                    )}
                    <div>
                        <p className="font-semibold">{token.name}</p>
                        <Badge variant="secondary">{token.symbol}</Badge>
                    </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-lg font-bold text-pink-500">${token.usdValue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                        {token.amount.toFixed(4)} {token.symbol}
                    </p>
                </div>
            </CardContent>
        </Card>
    </motion.div>
); 