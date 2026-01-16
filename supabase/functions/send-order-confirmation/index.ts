
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
    const payload = await req.json()
    const { orderId, email, type, amount } = payload;
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'vbuilt20@gmail.com' 
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'orders@visionbuilt.in';

    console.log(`[Email Function] Processing Order #${orderId} for ${email}`);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY missing in Secrets");
    }

    const resendRequest = async (to: string, subject: string, html: string) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `Vision Built <${SENDER_EMAIL}>`,
          to: [to],
          subject: subject,
          html: html
        })
      })
      return res;
    }

    // Send Admin Notification
    const adminRes = await resendRequest(
      ADMIN_EMAIL,
      `[NEW ORDER] Vision Built #${orderId}`,
      `<h1>New Order Received</h1><p><strong>Order ID:</strong> ${orderId}</p><p><strong>Client:</strong> ${email}</p><p><strong>Amount:</strong> $${amount}</p>`
    );
    const adminData = await adminRes.json();
    console.log("Admin email status:", adminRes.status, adminData);

    // Send Client Notification
    const clientRes = await resendRequest(
      email,
      `Order Confirmation - Vision Built #${orderId}`,
      `<h1>Order Confirmed!</h1><p>We've received your order #${orderId}. Our developers will contact you shortly.</p>`
    );
    const clientData = await clientRes.json();
    console.log("Client email status:", clientRes.status, clientData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error("[Email Function] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})

export {};