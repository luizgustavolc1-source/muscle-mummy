import { supabase } from "../lib/supabase";

export async function generateCoachDraft(type, client) {
  const { data, error } = await supabase.functions.invoke("coach-ai", {
    body: { type, client },
  });

  if (error) throw error;
  if (!data?.text) throw new Error("The AI generator did not return a draft.");
  return data.text;
}
