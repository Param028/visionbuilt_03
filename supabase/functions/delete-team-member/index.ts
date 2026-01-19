
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { userId } = await req.json()

    if (!userId) throw new Error("User ID is required");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Server Misconfiguration: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Secrets.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Optional: Nullify references in marketplace_items and tasks to prevent Foreign Key Violation errors.
    await supabaseAdmin.from('marketplace_items').update({ developer_id: null }).eq('developer_id', userId);
    await supabaseAdmin.from('tasks').update({ assigned_to_id: null }).eq('assigned_to_id', userId);
    await supabaseAdmin.from('tasks').update({ created_by_id: null }).eq('created_by_id', userId);
    
    // Delete the user from Auth (cascades to Profile because profile ID references auth ID on delete cascade)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
