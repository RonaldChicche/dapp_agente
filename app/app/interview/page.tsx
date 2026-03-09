"use client";

import React, { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    RealtimeSession,
    RealtimeItem,
} from "@openai/agents/realtime";
import { getSessionToken } from "../server/token";
import { createInterviewAgent } from "./agent";
import { VoiceWaves } from "@/components/ui/VoiceWaves";
import { Loader2 } from "lucide-react";

function InterviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userName = searchParams.get("name") || "Usuario";
    const userId = searchParams.get("userId") || "00000000-0000-0000-0000-000000000000";

    const session = useRef<RealtimeSession | null>(null);
    const hasConnected = useRef(false);
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [history, setHistory] = useState<RealtimeItem[]>([]);
    const [error, setError] = useState("");

    const connect = useCallback(async () => {
        // Prevent double-connection from React Strict Mode
        if (hasConnected.current) return;
        hasConnected.current = true;

        try {
            setConnecting(true);

            // Close any stale session
            if (session.current) {
                await session.current.close();
                session.current = null;
            }

            const token = await getSessionToken();
            const agent = createInterviewAgent(userName, userId);

            session.current = new RealtimeSession(agent, {
                model: "gpt-4o-realtime-preview-2025-06-03",
            });

            session.current.on("history_updated", (newHistory) => {
                setHistory([...newHistory]);
            });

            session.current.on("guardrail_tripped", (info) => {
                console.warn("Guardrail tripped:", info);
            });

            await session.current.connect({
                apiKey: token,
                // Configuración VAD: reduce sensibilidad al ruido de fondo
                turn_detection: {
                    type: "server_vad",
                    threshold: 0.5,
                    silence_duration_ms: 500,
                    prefix_padding_ms: 300,
                },
            } as any);

            setConnected(true);
            setConnecting(false);
        } catch (err: any) {
            console.error("Error al conectar:", err);
            setError(err?.message ?? "Error desconocido al conectar con el agente.");
            setConnecting(false);
            hasConnected.current = false; // Allow retry
        }
    }, [userName, userId]);

    // Auto-connect on mount (once)
    useEffect(() => {
        connect();
        return () => {
            if (session.current) {
                session.current.close();
                session.current = null;
            }
        };
    }, [connect]);

    // Extract the latest messages for UI display
    const messages = history.filter((item) => item.type === "message");
    const lastAgentMessage = [...messages].reverse().find((m) => m.role === "assistant");
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    const isSpeaking = connected && lastAgentMessage !== undefined;

    // Extract text from content array
    const getTextFromContent = (content: any[]): string => {
        if (!content) return "";
        return content
            .map((c: any) => c.text || c.transcript || "")
            .filter(Boolean)
            .join(" ");
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
                <div className="glass rounded-3xl p-10 max-w-md text-center space-y-6">
                    <h2 className="text-2xl font-bold text-red-500">Error de Conexión</h2>
                    <p className="text-foreground/80">{error}</p>
                    <button
                        onClick={() => {
                            setError("");
                            connect();
                        }}
                        className="bg-foreground text-background px-6 py-3 rounded-xl font-medium"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Entrevista de Voz</h1>
                    <p className="text-foreground/70">Asistente Crediticio IA</p>
                </div>

                {/* AI Agent Status Area */}
                <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-[350px] gap-8 transition-all duration-500 shadow-xl border border-white/10 relative overflow-hidden">

                    {/* Subtle glow background */}
                    <div className={`absolute inset-0 opacity-20 transition-opacity duration-700 ${connected ? 'bg-lavender-500/30' : 'bg-transparent'}`} />

                    {connecting ? (
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-lavender-500" />
                            <p className="text-xl font-medium text-foreground/80">Conectando con tu asesor...</p>
                        </div>
                    ) : (
                        <>
                            <div className="relative z-10 w-full">
                                <VoiceWaves isRecording={connected} isSpeaking={isSpeaking} />
                            </div>

                            <div className="text-center relative z-10 space-y-6 flex-1 flex flex-col justify-end max-h-[300px] overflow-y-auto w-full">
                                {lastAgentMessage && (
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-lg mx-auto transition-all">
                                        {getTextFromContent(lastAgentMessage.content)}
                                    </p>
                                )}
                                {lastUserMessage && (
                                    <p className="text-sm text-foreground/50 italic transition-all">
                                        Tú: &ldquo;{getTextFromContent(lastUserMessage.content)}&rdquo;
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Status text */}
                <p className="text-center text-sm text-foreground/60">
                    {connecting
                        ? "Preparando el agente de voz..."
                        : connected
                            ? "🎙️ Escuchando... Habla de forma natural."
                            : "Desconectado."}
                </p>

                {/* End session button */}
                {connected && messages.length > 2 && (
                    <div className="flex justify-center mt-6">
                        <button
                            onClick={() => {
                                session.current?.close();
                                session.current = null;
                                setConnected(false);
                                router.push(`/results?userId=${userId}`);
                            }}
                            className="flex items-center gap-3 bg-gradient-to-r from-lavender-500 to-mint-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 active:scale-95"
                        >
                            ✅ Finalizar Entrevista
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-lavender-500" />
            </div>
        }>
            <InterviewContent />
        </Suspense>
    );
}
