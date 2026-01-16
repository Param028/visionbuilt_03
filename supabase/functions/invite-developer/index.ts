
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { email, name, invited_by, role, redirectTo } = await req.json()

    // Validate inputs
    if (!email || !name) {
      throw new Error("Email and Name are required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const assignedRole = (role === 'admin' || role === 'developer') ? role : 'developer';
    
    console.log(`Inviting ${email} as ${assignedRole} by ${invited_by}`);

    let targetUserId;

    // 1. Try to invite the user
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { 
            full_name: name,
            role: assignedRole,
            invited_by: invited_by
        },
        redirectTo: redirectTo
    })

    if (inviteError) {
       console.log("Invite error:", inviteError.message);
       throw inviteError;
    }
    
    if (inviteData.user) {
        targetUserId = inviteData.user.id;
    } else {
        throw new Error("Failed to retrieve user ID from invite.");
    }

    // 2. Ensure Profile Exists & Update Role
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: targetUserId,
            email: email,
            name: name,
            role: assignedRole,
        })
    
    if (profileError) {
        console.error("Profile creation error:", profileError);
        throw new Error("User invited but profile creation failed: " + profileError.message);
    }

    return new Response(
      JSON.stringify({ user: inviteData.user, message: "Invitation sent successfully" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
