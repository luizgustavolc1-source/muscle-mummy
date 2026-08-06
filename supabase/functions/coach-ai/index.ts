import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return Response.json({ error: "Sign in is required." }, { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 401, headers: corsHeaders });

    const { type, client, messages } = await request.json();
    const isSecretary = type === "assistant";

    if (!isSecretary && (!["workout", "nutrition"].includes(type) || !client?.full_name)) {
      return Response.json({ error: "Invalid generator request." }, { status: 400, headers: corsHeaders });
    }

    if (isSecretary && (!Array.isArray(messages) || messages.length === 0)) {
      return Response.json({ error: "Enter a message for the AI Secretary." }, { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return Response.json({ error: "The AI generator has not been configured." }, { status: 503, headers: corsHeaders });

    const focus = type === "workout" ? "workout programme" : "nutrition plan";
    const transcript = isSecretary
      ? messages.slice(-12).map((message: { role?: string; text?: string }) => `${message.role === "assistant" ? "Secretary" : "Coach"}: ${String(message.text || "").slice(0, 2000)}`).join("\n\n")
      : "";
    const prompt = isSecretary
      ? `You are the private AI Secretary for a personal trainer using Muscle Mummy. Help with coaching administration, clear client messages, follow-up notes, weekly priorities and practical business organisation. Use Australian English. Keep answers concise, helpful and professional. Never claim to have sent messages or changed client records.\n\nConversation:\n${transcript}`
      : `Create a practical first draft of a ${focus} for a personal trainer to review.\n\nClient: ${client.full_name}\nGoal: ${client.goal || "General fitness"}\nHeight: ${client.height ? `${client.height} cm` : "not provided"}\nWeight: ${client.weight ? `${client.weight} kg` : "not provided"}\nCoach notes: ${client.coach_notes || "none"}\n\nUse clear headings, Australian English, and concise bullets. Do not diagnose medical conditions. Include a brief note that the coach must personalise and approve the draft before it is shared.`;

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4.1-mini", input: prompt }),
    });
    const result = await aiResponse.json();

    if (!aiResponse.ok) {
      const message = result?.error?.message || "AI generation failed.";
      console.error("OpenAI API error", {
        status: aiResponse.status,
        type: result?.error?.type,
        code: result?.error?.code,
        message,
      });

      return Response.json(
        { error: message },
        { status: 502, headers: corsHeaders },
      );
    }

    // `output_text` is an SDK convenience property. This function calls the
    // REST endpoint directly, so collect text from the response output array.
    const text = (result?.output ?? [])
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .filter((part: { type?: string }) => part.type === "output_text")
      .map((part: { text?: string }) => part.text ?? "")
      .join("\n")
      .trim();

    if (!text) {
      console.error("OpenAI returned no text output", { responseId: result?.id });
      return Response.json(
        { error: "The AI returned no text. Please try again." },
        { status: 502, headers: corsHeaders },
      );
    }

    return Response.json({ text }, { headers: corsHeaders });
  } catch (error) {
    console.error("Coach AI function error", error);
    return Response.json({ error: error.message || "AI generation failed." }, { status: 500, headers: corsHeaders });
  }
});
