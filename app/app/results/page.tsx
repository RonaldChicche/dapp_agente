"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircularScore } from '@/components/ui/CircularScore';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ResultsData {
    score: number;
    recommendations: string[];
}

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || '';
    const [data, setData] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchResults() {
            try {
                const response = await fetch(`/api/results?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('No se pudieron obtener los resultados.');
                }
                const resultData = await response.json();
                setData(resultData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-lavender-500 mb-4" />
                <h2 className="text-2xl font-semibold">Analizando tu perfil crediticio...</h2>
                <p className="text-foreground/70 mt-2 text-center max-w-sm">
                    Nuestro agente de inteligencia artificial está procesando tus respuestas y calculando tu score.
                </p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Ups, algo salió mal.</h2>
                <p className="text-foreground/80 mb-8">{error || "No se pudo cargar el análisis."}</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-foreground text-background px-6 py-3 rounded-xl font-medium"
                >
                    Volver al inicio
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-16 px-6 bg-background">
            <div className="w-full max-w-4xl space-y-12">

                {/* Header Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Tu Análisis Financiero</h1>
                    <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                        Basado en tu entrevista, aquí tienes tu Score Crediticio generado por IA y nuestras mejores recomendaciones para refinanciar tus opciones.
                    </p>
                </div>

                {/* Top Section: Score */}
                <div className="flex justify-center">
                    <div className="glass p-12 rounded-[3rem] shadow-xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-mint-500/5 group-hover:bg-mint-500/10 transition-colors duration-500" />
                        <div className="relative z-10">
                            <CircularScore score={data.score} />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: 5 Recommendations */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        5 Recomendaciones de Refinance
                    </h2>
                    <div className="grid gap-4">
                        {data.recommendations.map((rec, index) => (
                            <div
                                key={index}
                                className="glass p-6 rounded-2xl flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300 border border-white/5"
                            >
                                <div className="bg-lavender-100 text-lavender-900 rounded-full p-1 mt-0.5 shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <p className="text-foreground/90 leading-relaxed font-medium">
                                    {rec}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center pt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-full font-semibold hover:bg-foreground/90 transition-all hover:gap-4 active:scale-95"
                    >
                        Finalizar Proceso <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-lavender-500" />
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
