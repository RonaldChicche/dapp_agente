import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai-config";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId') || "00000000-0000-0000-0000-000000000000";

        // Fetch all user responses and their corresponding questions
        const { data: responses, error: rError } = await supabase
            .from('user_responses')
            .select(`
        response_text,
        scoring_questions (
          question_text
        )
      `)
            .eq('user_id', userId);

        if (rError || !responses || responses.length === 0) {
            return NextResponse.json({ error: "No responses found for user" }, { status: 404 });
        }

        // Format the history
        const contextLines = responses.map((r: any) =>
            `Pregunta: ${r.scoring_questions.question_text}\nRespuesta del usuario: ${r.response_text}`
        );
        const conversationHistory = contextLines.join("\n\n");

        const prompt = `Actúa como un experto asesor de crédito DeFi y Underwriter. 
A partir de la siguiente entrevista con el usuario, evalúa su perfil crediticio y calcula un "Score Crediticio" entre 0 y 100.
Luego, genera exactamente 5 recomendaciones accionables para ayudarle a mejorar sus finanzas o refinanciar sus deudas existentes.

Entrevista:
${conversationHistory}

Devuelve un JSON con la siguiente estructura ESTRICTA. No incluyas markdown, SOLO JSON válido:
{
  "score": number,
  "recommendations": [
    "Recomendación 1 corta y directa",
    "Recomendación 2...",
    "Recomendación 3...",
    "Recomendación 4...",
    "Recomendación 5..."
  ]
}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" }
        });

        const resultText = completion.choices[0].message.content || '{"score": 0, "recommendations": []}';
        return NextResponse.json(JSON.parse(resultText));

    } catch (error: any) {
        console.error("Error generating results:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
