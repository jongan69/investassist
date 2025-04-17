export function Overview({ trends, data }: { trends: any, data: any }) {
    return (
        <div className="prose prose-sm prose-invert max-w-full py-4">
            <div className="overflow-hidden rounded-lg shadow-sm ring-1 ring-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted transition-colors duration-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Crypto</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-muted-foreground uppercase">Averaged Price</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {['Bitcoin', 'Ethereum', 'Solana'].map((crypto) => (
                            <tr key={crypto} className="hover:bg-accent transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{crypto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    ${(() => {
                                        try {
                                            const price = trends[`${crypto.toLowerCase()}Price` as keyof TrendData] as string;
                                            const formattedPrice = Number(price.replace(",", "")).toFixed(2);
                                            const cryptoData = data.find((item: any) => item.shortName.toLowerCase() === crypto.toLowerCase());
                                            const yfianncePrice = cryptoData ? cryptoData.regularMarketPrice : Number(formattedPrice);
                                            const averagePrice = (Number(formattedPrice) + yfianncePrice) / 2;
                                            return averagePrice.toFixed(2);
                                        } catch (e) {
                                            return 'N/A';
                                        }
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}