
// Setup type definitions for Deno built-in environment
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS Preflight Request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // 2. Parse Body safely
    const bodyText = await req.text();
    let body;
    try {
        body = JSON.parse(bodyText);
    } catch (e) {
        throw new Error("Invalid JSON body");
    }
    
    const { amount, currency, receipt } = body;

    // 3. Validate Secrets
    const key_id = Deno.env.get('RAZORPAY_KEY_ID')
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!key_id || !key_secret) {
      console.error("ERROR: Razorpay keys are missing in Supabase Secrets.");
      return new Response(
        JSON.stringify({ error: "Server Misconfiguration: Razorpay keys not found." }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500, 
        }
      )
    }

    // 4. Create Razorpay Order
    const auth = btoa(`${key_id}:${key_secret}`)
    const amountInPaise = Math.floor(amount * 100);

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || 'INR',
        receipt: receipt,
        payment_capture: 1
      })
    })

    const data = await response.json()

    if (!response.ok) {
       console.error("Razorpay API Error:", data);
       return new Response(
         JSON.stringify({ error: data.error?.description || "Failed to create Razorpay order." }),
         {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 400,
         }
       )
    }

    return new Response(
      JSON.stringify({ razorpayOrderId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

export {};