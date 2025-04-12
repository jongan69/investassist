"use client";

// External library imports
import { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

// Internal imports
import { fetchBoxOffice } from "@/lib/solana/fetchBoxOffice";

interface TokenMetadata {
    name: string;
    symbol: string;
    image: string;
    extensions: {
        website: string;
        twitter: string;
        boxoffice: string;
    };
}

interface Token {
    name: string;
    ticker: string;
    ticketsSold: number;
    maxTicketSupply: number;
    tokenSupply: string;
    metadata: TokenMetadata;
    status: {
        initialized?: {};
        closed?: {};
    };
}

export default function BoxOffice() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchBoxOffice();
            setTokens(data.data);
        };
        fetchData();
    }, []);

    const formatSupply = (supply: string) => {
        const num = parseInt(supply);
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toString();
    };

    const getStatusColor = (status: Token["status"]) => {
        if (status.closed) return "text-red-500";
        if (status.initialized) return "text-green-500";
        return "text-yellow-500";
    };

    const getStatusText = (status: Token["status"]) => {
        if (status.closed) return "Closed";
        if (status.initialized) return "Active";
        return "Pending";
    };

    // Filtered Tokens Based on Search & Status
    const filteredTokens = tokens?.filter((token) => {
        const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.ticker.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" ||
            (statusFilter === "Active" && token.status.initialized) ||
            (statusFilter === "Closed" && token.status.closed);

        return matchesSearch && matchesStatus;
    });

    if (!tokens) return null;

    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen overflow-x-hidden z-10 max-w-[1920px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 max-w-[1600px] mx-auto">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Box Office Tokens</h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border bg-background w-full sm:w-[160px] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Closed</option>
                    </select>
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="search"
                        placeholder="Search tokens..."
                        className="px-3 py-2 rounded-lg border bg-background w-full sm:w-[240px] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Scrollable Token List */}
            <div className="max-h-[700px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <div className="grid grid-cols-1 gap-6 lg:gap-8">
                    {filteredTokens.length > 0 ? (
                        filteredTokens?.map((token) => (
                            <div 
                                key={token.ticker}
                                onClick={() => window.open(token.metadata.extensions.boxoffice, "_blank")}
                                className="w-full rounded-xl border bg-card p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50"
                            >
                                {/* Header Section */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {token.metadata?.image && (
                                            <div className="relative h-14 w-14 flex-shrink-0 rounded-full overflow-hidden">
                                                <Image
                                                    src={token.metadata.image}
                                                    alt={token.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-semibold text-lg truncate">{token.name}</h2>
                                            <p className="text-sm text-muted-foreground truncate">${token.ticker}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium flex-shrink-0 ml-2 ${getStatusColor(token.status)}`}>
                                        {getStatusText(token.status)}
                                    </span>
                                </div>

                                {/* Ticket Sales */}
                                <div className="space-y-4">
                                    <div className="flex flex-wrap justify-between text-sm gap-2">
                                        <span className="text-muted-foreground">Tickets Sold</span>
                                        <span className="font-medium">{token.ticketsSold} / {token.maxTicketSupply}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div 
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${(token.ticketsSold / token.maxTicketSupply) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap justify-between text-sm gap-2">
                                        <span className="text-muted-foreground">Token Supply</span>
                                        <span className="font-medium">{formatSupply(token.tokenSupply)}</span>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="flex flex-wrap gap-3 mt-6">
                                    {token.metadata?.extensions?.twitter && (
                                        <a 
                                            href={token.metadata.extensions.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1.5 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Twitter <ExternalLink size={16} />
                                        </a>
                                    )}
                                    {token.metadata?.extensions?.website && (
                                        <a 
                                            href={token.metadata.extensions.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-purple-500 hover:text-purple-600 hover:underline flex items-center gap-1.5 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            Website <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">No tokens found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
