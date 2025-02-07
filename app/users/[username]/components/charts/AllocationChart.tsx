import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { AllocationData } from '@/types/users';
import { useEffect, useState } from 'react';

const COLORS = {
    dark: ['#fa6ece', '#63b3ed', '#48bb78', '#f6ad55', '#fc8181', '#b794f4', '#f687b3'],
    light: ['#d53f8c', '#4299e1', '#38a169', '#ed8936', '#e53e3e', '#805ad5', '#d53f8c']
};

const RADIAN = Math.PI / 180;
const MIN_DISTANCE = 40; // Minimum distance between labels
const MIN_ANGLE = 10; // Minimum angle in degrees between sections for external labels

export const AllocationChart = ({ allocations }: { allocations: AllocationData[] }) => {
    const { resolvedTheme } = useTheme();
    const colors = resolvedTheme === 'dark' ? COLORS.dark : COLORS.light;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
            updateDimensions();
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const updateDimensions = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobileView = width < 640;
        
        setDimensions({
            width: width,
            height: isMobileView ? 500 : Math.min(height * 0.6, 600)
        });
    };

    const calculateRadius = () => {
        const minDimension = Math.min(dimensions.width, dimensions.height);
        const baseRadius = isMobile 
            ? minDimension * 0.2
            : minDimension * 0.35;
        
        return {
            outer: Math.min(baseRadius, isMobile ? 80 : 180),
            inner: Math.min(baseRadius * 0.6, isMobile ? 40 : 100)
        };
    };

    const { outer, inner } = calculateRadius();

    // Helper function to calculate label position
    const getLabelPosition = (midAngle: number, radius: number, cx: number, cy: number) => {
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return { x, y };
    };

    // Calculate optimal label positions to avoid overlap
    const calculateLabelPositions = (cx: number, cy: number, radius: number, data: any[]) => {
        // Sort data by percentage to handle small values first
        const sortedData = [...data].sort((a, b) => a.percentage - b.percentage);
        const angleData = sortedData.map(entry => ({
            ...entry,
            angle: (entry.endAngle - entry.startAngle)
        }));

        const positions = data.map((entry, index) => {
            const midAngle = (entry.startAngle + entry.endAngle) / 2;
            const basePos = getLabelPosition(midAngle, radius, cx, cy);
            const isRightSide = basePos.x > cx;
            
            // Calculate angle size for current slice
            const angleSize = entry.endAngle - entry.startAngle;
            
            // Adjust radius based on percentage
            const percentage = entry.percentage;
            const dynamicRadius = radius + (percentage < 5 ? 20 : 0); // Push out smaller slices
            
            // Recalculate position with adjusted radius
            const adjustedBasePos = getLabelPosition(midAngle, dynamicRadius, cx, cy);
            
            // Calculate vertical spacing based on available height and percentage
            const totalHeight = dimensions.height * 0.6;
            const minSpacing = MIN_DISTANCE * (isMobile ? 0.8 : 1);
            const maxSpacing = totalHeight / (data.length / 2);
            
            // Use percentage to determine spacing
            const spacing = Math.max(
                minSpacing,
                Math.min(maxSpacing, totalHeight * (percentage / 100))
            );
            
            let adjustedY = cy - totalHeight / 3;
            
            // Distribute labels evenly on their respective sides
            if (isRightSide) {
                const rightSideLabels = data.filter((_, i) => {
                    const angle = (data[i].startAngle + data[i].endAngle) / 2;
                    return getLabelPosition(angle, radius, cx, cy).x > cx;
                });
                const rightIndex = rightSideLabels.findIndex(item => item === entry);
                if (rightIndex !== -1) {
                    adjustedY += rightIndex * spacing;
                }
            } else {
                const leftSideLabels = data.filter((_, i) => {
                    const angle = (data[i].startAngle + data[i].endAngle) / 2;
                    return getLabelPosition(angle, radius, cx, cy).x <= cx;
                });
                const leftIndex = leftSideLabels.findIndex(item => item === entry);
                if (leftIndex !== -1) {
                    adjustedY += leftIndex * spacing;
                }
            }

            return {
                x: adjustedBasePos.x,
                y: adjustedY,
                midAngle,
                isRightSide,
                useExternalLabel: angleSize < MIN_ANGLE * RADIAN || percentage < 5
            };
        });

        return positions;
    };

    // Custom label component with improved positioning
    const renderCustomLabel = ({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index, startAngle, endAngle }: any) => {
        const radius = outerRadius + (isMobile ? 30 : 50);
        const positions = calculateLabelPositions(cx, cy, radius, allocations);
        const pos = positions[index];
        
        // Always use external labels for mobile or small percentages
        if (isMobile || pos.useExternalLabel) {
            const controlPoint = {
                x: cx + (radius * 0.7 * Math.cos(-midAngle * RADIAN)),
                y: cy + (radius * 0.7 * Math.sin(-midAngle * RADIAN))
            };

            return (
                <>
                    <path
                        d={`M ${cx + (outerRadius * Math.cos(-midAngle * RADIAN))},${
                            cy + (outerRadius * Math.sin(-midAngle * RADIAN))
                        } 
                        Q ${controlPoint.x},${controlPoint.y}
                        ${pos.x},${pos.y}`}
                        stroke={colors[index % colors.length]}
                        fill="none"
                        strokeWidth={1}
                    />
                    <text
                        x={pos.x + (pos.isRightSide ? 5 : -5)}
                        y={pos.y}
                        textAnchor={pos.isRightSide ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-[10px] fill-current"
                        style={{ fontWeight: 500 }}
                    >
                        {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                </>
            );
        }

        // Desktop: Show name and percentage inside the pie
        const angle = (startAngle + endAngle) / 2;
        const sin = Math.sin(-RADIAN * angle);
        const cos = Math.cos(-RADIAN * angle);
        const textRadius = (innerRadius + outerRadius) / 2;
        const x = cx + textRadius * cos;
        const y = cy + textRadius * sin;

        // Keep text horizontal
        const isRightSide = x > cx;
        const textAnchorValue = isRightSide ? 'start' : 'end';
        const xOffset = isRightSide ? 10 : -10;

        return (
            <text
                x={x + xOffset}
                y={y}
                textAnchor={textAnchorValue}
                dominantBaseline="central"
                className="text-xs fill-current"
                style={{ fontWeight: 500 }}
            >
                <tspan x={x + xOffset} dy="-0.5em">{name}</tspan>
                <tspan x={x + xOffset} dy="1.5em">{`${(percent * 100).toFixed(0)}%`}</tspan>
            </text>
        );
    };

    return (
        <div className="w-full h-full" style={{ height: `${dimensions.height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={allocations}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={outer}
                        innerRadius={inner}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="asset"
                        paddingAngle={2}
                    >
                        {allocations.map((_, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={colors[index % colors.length]}
                                className="hover:opacity-80 transition-opacity duration-200"
                            />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)', 
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px',
                        }}
                        content={({ active, payload }) => {
                            if (active && payload?.[0]) {
                                return (
                                    <div className="bg-white dark:bg-gray-800 p-2 rounded-md">
                                        <p className="text-sm font-medium">{payload[0].name}</p>
                                        <p className="text-xs text-gray-500">{(Number(payload[0].value)).toFixed(2)}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend 
                        verticalAlign="bottom"
                        height={dimensions.height * (isMobile ? 0.25 : 0.2)}
                        formatter={(value) => (
                            <span className="text-[10px] sm:text-xs font-medium px-1 sm:px-2 py-0.5">
                                {value}
                            </span>
                        )}
                        wrapperStyle={{
                            paddingTop: '4rem',
                            paddingBottom: '4rem',
                            marginBottom: '4rem',
                            width: '100%',
                            fontSize: '10px',
                        }}
                        iconSize={isMobile ? 8 : 12}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}; 