// lib/analytics.ts
import { supabase } from "../supabaseClient";

export async function logLSAEvent(
  userId: string | undefined,
  fullName: string | null | undefined, 
  actionState: string,
  contextData: Record<string, any> = {}
) {
  if (!userId) return;

  let sessionId = sessionStorage.getItem("lsa_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("lsa_session_id", sessionId);
  }

  await supabase.from("lsa_logs").insert([{
    user_id: userId,
    full_name: fullName, 
    session_id: sessionId,
    action_state: actionState,
    context_data: contextData
  }]);
}