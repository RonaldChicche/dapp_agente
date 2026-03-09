"use client"

import React from 'react';

interface VoiceWavesProps {
    isRecording: boolean;
    isSpeaking: boolean;
}

export function VoiceWaves({ isRecording, isSpeaking }: VoiceWavesProps) {
    // Generates 5 bars for the wave animation
    const bars = Array.from({ length: 5 });

    return (
        <div className="flex items-center justify-center h-24 gap-1.5">
            {bars.map((_, i) => (
                <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-300 ${isRecording
                            ? 'bg-mint-500 animate-pulse'
                            : isSpeaking
                                ? 'bg-lavender-500 animate-bounce'
                                : 'bg-foreground/20 h-2'
                        }`}
                    style={{
                        height: isRecording || isSpeaking ? `${Math.random() * 40 + 20}px` : '8px',
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            ))}
        </div>
    );
}
