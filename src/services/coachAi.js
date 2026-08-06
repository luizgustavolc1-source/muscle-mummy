import { supabase } from "../lib/supabase";

async function invokeCoachAi(body) {
  const { data, error } = await supabase.functions.invoke("coach-ai", { body });

  if (error) {
    const errorBody = await error.context?.clone?.().json?.().catch(() => null);
    throw new Error(errorBody?.error || error.message || "The AI request failed.");
  }

  if (!data?.text) throw new Error(data?.error || "The AI generator did not return a draft.");
  return data.text;
}

export function generateCoachDraft(type, clientId, adjustments = []) {
  return invokeCoachAi({ type, clientId, adjustments });
}

export function askAiSecretary(messages) {
  return invokeCoachAi({ type: "assistant", messages });
}
