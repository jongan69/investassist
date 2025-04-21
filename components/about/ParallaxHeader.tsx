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
    tokenInfo?: ExtendedTokenInfo;
    contractAddress?: string;
    moonshotLink?: string;
}

export default function ParallaxHeader({
    imageUrl,
    tokenInfo = {} as ExtendedTokenInfo,
    contractAddress,
    moonshotLink
}: ParallaxHeaderProps) {
    const [scrollY, setScrollY] = useState(0);
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


    // Format number with appropriate precision
    const formatNumber = (value: number | undefined, decimals = 2, isPercentage = false) => {
        if (value === undefined || value === null) return '0.00';
        return isPercentage 
            ? `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
            : value.toFixed(decimals);
    };

    // Format large numbers with commas
    const formatLargeNumber = (value: number | undefined) => {
        if (value === undefined || value === null) return '0';
        return value.toLocaleString();
    };

    return (
        <div ref={headerRef} className="relative h-[500px] sm:h-[600px] overflow-hidden z-10">
            {/* Background Image with Parallax Effect */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    transform: `translateY(${scrollY}px)`,
                    transition: 'transform 0.1s ease-out',
                }}
            >
                <Image
                    src={imageUrl || '/banner.jpg'}
                    alt="Header Background"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Grid Pattern and Particles */}
            <div className="absolute inset-0">
                <GridPattern />
                <Particles />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-4 pt-8 sm:pt-12 z-20">
                <div className="max-w-4xl w-full mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                        InvestAssist
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8">
                        Your AI-Powered Investment Companion
                    </p>

                    {/* Token Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                            <div className="text-white/80 text-xs sm:text-sm mb-1">Price</div>
                            <div className="text-white text-base sm:text-xl font-semibold">
                                ${formatNumber(tokenInfo?.price, 6)}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                            <div className="text-white/80 text-xs sm:text-sm mb-1">24h Change</div>
                            <div className={`text-base sm:text-xl font-semibold ${(tokenInfo?.priceChange24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {formatNumber(tokenInfo?.priceChange24h, 2, true)}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                            <div className="text-white/80 text-xs sm:text-sm mb-1">Market Cap</div>
                            <div className="text-white text-base sm:text-xl font-semibold">
                                ${formatLargeNumber(tokenInfo?.marketCap)}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                            <div className="text-white/80 text-xs sm:text-sm mb-1">24h Volume</div>
                            <div className="text-white text-base sm:text-xl font-semibold">
                                ${formatLargeNumber(tokenInfo?.volume24h)}
                            </div>
                        </div>
                    </div>

                    {/* Contract Address */}
                    {contractAddress && (
                        <div className="flex justify-center">
                            <ContractAddress address={contractAddress} />
                        </div>
                    )}

                    {/* Moonshot Link Button */}
                    {moonshotLink && (
                        <div className="mt-4">
                            <a 
                                href={moonshotLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Invest Now
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 