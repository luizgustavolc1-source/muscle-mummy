import { supabase } from "../lib/supabase";

export async function generateCoachDraft(type, client) {
  const { data, error } = await supabase.functions.invoke("coach-ai", {
    body: { type, client },
  });

  if (error) {
    const errorBody = await error.context?.clone?.().json?.().catch(() => null);
    throw new Error(errorBody?.error || error.message || "The AI request failed.");
  }

  if (!data?.text) throw new Error(data?.error || "The AI generator did not return a draft.");
  return data.text;
}
