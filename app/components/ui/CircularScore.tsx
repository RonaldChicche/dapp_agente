import React from 'react';

interface CircularScoreProps {
    score: number;
}

export function CircularScore({ score }: CircularScoreProps) {
    // SVG properties
    const size = 200;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Progress offset
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center inline-flex" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-foreground/10"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className="text-mint-500 transition-all duration-1000 ease-out"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {/* Score Text inside */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-sans tracking-tight">{score}</span>
                <span className="text-sm font-medium text-foreground/60 mt-1 uppercase tracking-widest">Score</span>
            </div>
        </div>
    );
}
