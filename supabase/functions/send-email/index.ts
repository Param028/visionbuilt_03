
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailPayload {
  type: 'welcome' | 'order_confirmation' | 'admin_alert' | 'order_update';
  email: string;
  data?: any;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'onboarding@resend.dev'; 
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');

    // validate configuration
    if (!RESEND_API_KEY) {
      console.error("CRITICAL: RESEND_API_KEY is missing in Edge Function Secrets.");
      throw new Error('Server configuration error: Missing Email API Key');
    }

    const payload: EmailPayload = await req.json();
    const { type, email, data } = payload;

    if (!email) {
      throw new Error('Recipient email is required');
    }

    let subject = '';
    let html = '';
    let to = [email];

    // --- TEMPLATE LOGIC ---
    switch (type) {
      case 'welcome':
        subject = 'Welcome to Vision Built';
        html = `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #06b6d4;">Welcome to the Future.</h1>
            <p>Hi there,</p>
            <p>Thank you for joining Vision Built. Your account has been successfully created.</p>
            <p>You can now browse our marketplace, request custom services, and track your orders in real-time.</p>
            <br/>
            <a href="https://visionbuilt.in" style="background-color: #06b6d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
          </div>
        `;
        break;

      case 'order_confirmation':
        subject = `Order Confirmation #${data.orderId.slice(0, 8)}`;
        html = `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: #06b6d4;">Order Received</h1>
            <p>We have received your request for <strong>${data.serviceTitle}</strong>.</p>
            <p><strong>Order ID:</strong> ${data.orderId}</p>
            <p><strong>Amount:</strong> $${data.amount}</p>
            <p>A developer will review your requirements and update the status shortly.</p>
          </div>
        `;
        break;

      case 'admin_alert':
        if (ADMIN_EMAIL) {
            to = [ADMIN_EMAIL];
        } else {
            console.warn("ADMIN_EMAIL not set, skipping admin alert.");
            return new Response(JSON.stringify({ message: "Admin email skipped" }), { headers: corsHeaders });
        }
        subject = `[NEW ORDER] ${data.amount > 0 ? 'PAID' : 'REQUEST'} - $${data.amount}`;
        html = `
          <h1>New Transaction</h1>
          <p><strong>User:</strong> ${data.userEmail}</p>
          <p><strong>Service:</strong> ${data.serviceTitle}</p>
          <p><strong>Total:</strong> $${data.amount}</p>
        `;
        break;

      case 'order_update':
        const statusPretty = data.status.replace('_', ' ').toUpperCase();
        subject = `Update on Order #${data.orderId.slice(0, 6)}: ${statusPretty}`;
        html = `
          <div style="font-family: sans-serif; color: #333;">
             <h2 style="color: #06b6d4;">Status Update</h2>
             <p>Your order for <strong>${data.serviceTitle}</strong> has been updated.</p>
             <p><strong>New Status:</strong> <span style="background-color: #eee; padding: 2px 6px; border-radius: 4px;">${statusPretty}</span></p>
             <p>Log in to your dashboard to view details or chat with the developer.</p>
             <br/>
             <a href="https://visionbuilt.in/dashboard/order/${data.orderId}" style="background-color: #06b6d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid email type: ' + type);
    }

    // --- SEND VIA RESEND ---
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Vision Built <${SENDER_EMAIL}>`,
        to: to,
        subject: subject,
        html: html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend API Error:', result);
      throw new Error(result.message || result.name || 'Failed to send email via Resend');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Email Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

export {};
