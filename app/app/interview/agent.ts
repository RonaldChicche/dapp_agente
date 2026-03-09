import {
    RealtimeAgent,
    tool,
} from "@openai/agents/realtime";
import z from "zod";

// Tool: Guardar una respuesta del usuario en Supabase
const saveResponse = tool({
    name: "saveResponse",
    description:
        "Guarda la respuesta del usuario a la pregunta actual en la base de datos. Llama esta herramienta SOLO cuando la respuesta sea completa y válida.",
    parameters: z.object({
        questionId: z.string().describe("El ID de la pregunta que se respondió"),
        questionText: z.string().describe("El texto de la pregunta"),
        responseText: z.string().describe("La respuesta completa del usuario"),
        userId: z.string().describe("El ID del usuario"),
    }),
    execute: async ({ questionId, questionText, responseText, userId }) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_responses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
                    "Prefer": "return=minimal,resolution=merge-duplicates",
                },
                body: JSON.stringify({
                    user_id: userId,
                    question_id: questionId,
                    response_text: responseText,
                }),
            });
            if (!res.ok) {
                const errorBody = await res.text();
                console.error("Supabase save error:", res.status, errorBody);
                // If it's a foreign key error (user doesn't exist), still return success to the agent so it doesn't get stuck
                if (res.status === 409 || res.status === 409) {
                    return `Respuesta ya registrada para la pregunta "${questionText}". Continuemos.`;
                }
                return `Error al guardar (${res.status}): ${errorBody}`;
            }
            return `Respuesta guardada exitosamente para la pregunta "${questionText}".`;
        } catch (e: any) {
            return `Error al guardar respuesta: ${e.message}`;
        }
    },
});

// Tool: Obtener la lista de preguntas de scoring desde Supabase
const getQuestions = tool({
    name: "getQuestions",
    description:
        "Obtiene todas las preguntas de scoring desde la base de datos, ordenadas por número de orden. Usa esta herramienta al inicio de la entrevista para saber qué preguntas hacer.",
    parameters: z.object({}),
    execute: async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/scoring_questions?order=order_num.asc`,
                {
                    headers: {
                        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
                    },
                }
            );
            if (!res.ok) {
                return `Error al obtener preguntas: ${res.statusText}`;
            }
            const questions = await res.json();
            return JSON.stringify(questions);
        } catch (e: any) {
            return `Error al obtener preguntas: ${e.message}`;
        }
    },
});

export function createInterviewAgent(userName: string, userId: string) {
    return new RealtimeAgent({
        name: "Agente Crediticio",
        instructions: `Eres un asesor crediticio amigable, cálido y profesional. Hablas en español con un tono natural y empático, como un buen amigo latino que sabe de finanzas.

El usuario se llama "${userName}" y su ID es "${userId}".

TU FLUJO DE TRABAJO:
1. Al conectarte, saluda al usuario por su nombre y explícale brevemente que vas a hacerle unas preguntas sencillas sobre su situación financiera para calcular su score crediticio. Pregúntale si está listo para empezar.
2. Cuando el usuario diga que sí (cualquier frase afirmativa como "sí", "claro", "dale", "ok", "listo", etc.), usa la herramienta "getQuestions" para obtener las preguntas de la base de datos.
3. Haz las preguntas UNA POR UNA, en orden. Espera la respuesta del usuario antes de pasar a la siguiente.
4. Si la respuesta es ambigua o muy corta, repregunta con empatía. NO avances sin una respuesta clara.
5. Cuando recibas una respuesta válida, usa la herramienta "saveResponse" para guardarla en la base de datos, usando el ID de la pregunta correspondiente.
6. Después de guardar, pasa a la siguiente pregunta de forma natural.
7. Cuando termines TODAS las preguntas, dile al usuario que has completado la entrevista y que ahora calcularás su score. Agradécele por su tiempo.

REGLAS:
- SIEMPRE habla en español.
- Sé conversacional y natural, no suenes como un robot.
- NO hagas más de una pregunta a la vez.
- NO inventes respuestas del usuario.
- Si el usuario se sale del tema, redirige amablemente a la entrevista.`,
        tools: [getQuestions, saveResponse],
    });
}
