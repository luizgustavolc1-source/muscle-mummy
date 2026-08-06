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

    const { type, clientId, messages, adjustments = [] } = await request.json();
    const isSecretary = type === "assistant";

    if (!isSecretary && (!["workout", "nutrition"].includes(type) || !clientId)) {
      return Response.json({ error: "Invalid generator request." }, { status: 400, headers: corsHeaders });
    }

    if (isSecretary && (!Array.isArray(messages) || messages.length === 0)) {
      return Response.json({ error: "Enter a message for the AI Secretary." }, { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return Response.json({ error: "The AI generator has not been configured." }, { status: 503, headers: corsHeaders });

    let client: Record<string, unknown> | null = null;
    let checkins: Array<Record<string, unknown>> = [];
    let previousPlans: Array<Record<string, unknown>> = [];

    if (!isSecretary) {
      const { data, error } = await supabase.from("clients").select("*").eq("id", clientId).single();
      if (error || !data) return Response.json({ error: "Client not found or not available." }, { status: 404, headers: corsHeaders });
      client = data;

      const [{ data: checkinData }, { data: planData }] = await Promise.all([
        supabase.from("checkins").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(8),
        supabase.from("ai_client_plans").select("plan_type, adjustments, content, created_at").eq("client_id", clientId).order("created_at", { ascending: false }).limit(4),
      ]);
      checkins = checkinData || [];
      previousPlans = planData || [];
    }

    const focus = type === "workout" ? "workout programme" : "nutrition plan";
    const transcript = isSecretary
      ? messages.slice(-40).map((message: { role?: string; text?: string }) => `${message.role === "assistant" ? "Secretary" : "Coach"}: ${String(message.text || "").slice(0, 2000)}`).join("\n\n")
      : "";
    const prompt = isSecretary
      ? `You are the private AI Secretary for a personal trainer using Muscle Mummy. Help with coaching administration, clear client messages, follow-up notes, weekly priorities and practical business organisation. Use Australian English. Keep answers concise, helpful and professional. Never claim to have sent messages or changed client records.\n\nConversation:\n${transcript}`
      : `Create a practical first draft of a ${focus} for a personal trainer to review.\n\nClient: ${client?.full_name || "Client"}\nGoal: ${client?.goal || "General fitness"}\nHeight: ${client?.height ? `${client.height} cm` : "not provided"}\nWeight: ${client?.weight ? `${client.weight} kg` : "not provided"}\nCoach notes: ${client?.coach_notes || "none"}\n\nRequested changes: ${adjustments.length ? adjustments.join("; ") : "Maintain the current approach unless the history indicates a better adjustment."}\n\nRecent check-ins:\n${checkins.length ? checkins.map((item) => `- ${item.created_at || "Recent"}: weight ${item.weight || "not recorded"}; notes ${item.notes || "none"}`).join("\n") : "No check-ins recorded."}\n\nPrevious generated plans:\n${previousPlans.length ? previousPlans.map((plan) => `- ${plan.plan_type} (${plan.created_at}): ${String(plan.content || "").slice(0, 3000)}`).join("\n\n") : "No previous generated plans."}\n\nUse the history to avoid repeating the same plan without a reason. Explain the key changes briefly. Use clear headings, Australian English, and concise bullets. Do not diagnose medical conditions. For nutrition, do not make extreme calorie or macro changes; state assumptions when targets are missing. Include a brief note that the coach must personalise and approve the draft before it is shared.`;

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
