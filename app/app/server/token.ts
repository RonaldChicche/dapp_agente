"use server";

import OpenAI from "openai";

export async function getSessionToken() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY no está configurada en .env.local");
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const clientSecret = await openai.realtime.clientSecrets.create({
        session: {
            type: "realtime",
            model: "gpt-4o-realtime-preview-2025-06-03",
            instructions: "Responde siempre en español. Nunca uses otro idioma.",
            audio: {
                output: {
                    voice: "coral",
                },
            },
        },
    });

    return clientSecret.value;
}
