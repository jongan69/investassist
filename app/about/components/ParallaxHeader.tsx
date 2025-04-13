'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Particles from './Particles';
import GridPattern from './GridPattern';
import ContractAddress from './ContractAddress';
import { TokenInfo } from '@/types/dexscreener';

// Extend the TokenInfo interface with additional properties
interface ExtendedTokenInfo extends TokenInfo {
    price?: number;
    priceChange24h?: number;
    marketCap?: number;
    volume24h?: number;
}

interface ParallaxHeaderProps {
    imageUrl: string;
    tokenInfo: ExtendedTokenInfo;
    mainPair: string;
    contractAddress: string;
    moonshotLink: string;
}

export default function ParallaxHeader({
    imageUrl,
    tokenInfo,
    mainPair,
    contractAddress,
    moonshotLink
}: ParallaxHeaderProps) {
    const [scrollY, setScrollY] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                const { top } = headerRef.current.getBoundingClientRect();
                setScrollY(-top * 0.5);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const suggestions = [
        'Market Analysis',
        'Portfolio Tracking',
        'Investment Insights',
        'Real-Time Data',
        'AI-Powered Analysis',
    ];

    // console.log(tokenInfo)
    return (
        <div ref={headerRef} className="relative h-[600px] overflow-hidden z-10">
            {/* Background Image with Parallax Effect */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    transform: `translateY(${scrollY}px)`,
                    transition: 'transform 0.1s ease-out',
                }}
            >
                <Image
                    src={imageUrl}
                    alt="Header Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Grid Pattern and Particles */}
            <div className="absolute inset-0">
                <GridPattern />
                <Particles />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-4 z-20">
                <div className="max-w-4xl w-full mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                        InvestAssist
                    </h1>
                    <p className="text-xl sm:text-2xl text-white/90 mb-8">
                        Your AI-Powered Investment Companion
                    </p>

                    {/* Token Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="text-white/80 text-sm mb-1">Price</div>
                            <div className="text-white text-xl font-semibold">
                                ${tokenInfo.price?.toFixed(6) || '0.00'}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="text-white/80 text-sm mb-1">24h Change</div>
                            <div className={`text-xl font-semibold ${(tokenInfo.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {(tokenInfo.priceChange24h || 0) >= 0 ? '+' : ''}{tokenInfo.priceChange24h?.toFixed(2) || '0.00'}%
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="text-white/80 text-sm mb-1">Market Cap</div>
                            <div className="text-white text-xl font-semibold">
                                ${tokenInfo.marketCap?.toLocaleString() || '0'}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                            <div className="text-white/80 text-sm mb-1">24h Volume</div>
                            <div className="text-white text-xl font-semibold">
                                ${tokenInfo.volume24h?.toLocaleString() || '0'}
                            </div>
                        </div>
                    </div>

                    {/* Contract Address */}
                    <div className="flex justify-center">
                        <ContractAddress address={contractAddress} />
                    </div>
                </div>
            </div>
        </div>
    );
} 