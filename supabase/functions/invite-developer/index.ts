
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
    const { email, name, invited_by, role, redirectTo, password } = await req.json()

    // Validate inputs
    if (!email || !name) {
      throw new Error("Email and Name are required.");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Server Misconfiguration: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Secrets.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const assignedRole = (role === 'admin' || role === 'developer') ? role : 'developer';
    
    console.log(`Processing invite for ${email} as ${assignedRole} by ${invited_by}`);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.from('profiles').select('id').eq('email', email).single();
    let targetUserId = existingUser?.id;

    if (existingUser) {
        // User exists - Update password and role
        console.log(`User exists (${existingUser.id}), updating credentials...`);
        
        const updateData: any = {
            email_confirm: true,
            user_metadata: {
                full_name: name,
                role: assignedRole
            }
        };
        if (password) {
            updateData.password = password;
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, updateData);
        if (updateError) throw updateError;

    } else {
        // User does not exist - Create new
        if (password) {
            // Method 1: Direct Creation with Password (Admin sets it)
            const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto verify since admin created it
                user_metadata: {
                    full_name: name,
                    role: assignedRole,
                    invited_by
                }
            });

            if (createError) throw createError;
            targetUserId = createData.user.id;

        } else {
            // Method 2: Standard Invite Link (No password set yet)
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: { 
                    full_name: name,
                    role: assignedRole,
                    invited_by: invited_by
                },
                redirectTo: redirectTo
            });

            if (inviteError) throw inviteError;
            targetUserId = inviteData.user.id;
        }
    }

    // 2. Ensure Profile Exists & Update Role (Trigger might have done this, but upsert ensures role is correct)
    if (targetUserId) {
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: targetUserId,
                email: email,
                name: name,
                role: assignedRole,
                email_verified: true
            });
        
        if (profileError) {
            console.error("Profile sync error:", profileError);
            throw new Error("User auth updated but profile sync failed: " + profileError.message);
        }
    }

    return new Response(
      JSON.stringify({ message: "User account configured successfully" }),
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
