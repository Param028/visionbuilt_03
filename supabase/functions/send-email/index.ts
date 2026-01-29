
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
    const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'noreply@visionbuilt.in'; 
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
    
    // --- Anti-Deduplication & Troubleshooting Info ---
    const uniqueId = data?.uniqueId || Date.now();
    const hiddenFooter = `
      <div style="display:none; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">
        Message-ID: ${uniqueId}
        Timestamp: ${new Date().toISOString()}
      </div>
    `;

    // --- TEMPLATE LOGIC ---
    switch (type) {
      case 'welcome':
        subject = 'Welcome to Vision Built';
        html = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #06b6d4; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">Welcome to Vision Built</h1>
            <p>Hi ${data?.name || 'there'},</p>
            <p>Thank you for joining our platform. We are excited to help you build the future.</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                    <strong>✅ Verification Required:</strong><br/>
                    We have sent a separate email containing a secure link to verify your account. Please click that link to activate your dashboard access.
                </p>
            </div>

            <p>Once verified, you can:</p>
            <ul>
                <li>Request custom software development</li>
                <li>Browse our marketplace of ready-made projects</li>
                <li>Track orders in real-time</li>
            </ul>
            <br/>
            <div style="text-align: center;">
                <a href="https://visionbuilt.in/auth" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Login</a>
            </div>
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #888; text-align: center;">Vision Built - Precision Digital Craft</p>
            ${hiddenFooter}
          </div>
        `;
        break;

      case 'order_confirmation':
        // LOGIC: Distinguish between Paid Order, Free Download, and Custom Request
        const isZeroAmount = data.amount === 0;
        const isRequest = !data.amount || data.amount === 0; 
        
        let title = 'Order Confirmed';
        let statusText = 'Processing';
        let amountDisplay = `$${data.amount}`;
        
        if (isZeroAmount) {
            // Check context if possible, or assume generic "Request" / "Free"
            // For services (Custom), it is "Request Received".
            // For marketplace (Free), it is "Project Access".
            // Since we might not differentiate types strictly here, we use generic safe language.
            title = 'Request Received';
            statusText = 'Pending Review / Access Granted';
            amountDisplay = '<span style="color: #10b981;">Free / TBD</span>';
        }

        subject = `${title}: #${data.orderId.slice(0, 8)}`;
        html = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #06b6d4;">${title}</h1>
            <p>We have received your order for <strong>${data.serviceTitle}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                <p style="margin: 5px 0;"><strong>Total:</strong> ${amountDisplay}</p>
            </div>
            ${isZeroAmount 
                ? `<p style="color: #666;">If this is a <strong>Custom Order</strong>, a developer will review your requirements and send a formal quote shortly.<br/><br/>If this is a <strong>Free Project</strong>, your files are available instantly in the dashboard.</p>` 
                : `<p>Thank you for your payment. Your project is now in ${statusText} status.</p>`
            }
            <br/>
            <div style="text-align: center;">
                <a href="https://visionbuilt.in/dashboard/order/${data.orderId}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Dashboard</a>
            </div>
            ${hiddenFooter}
          </div>
        `;
        break;

      case 'admin_alert':
        if (ADMIN_EMAIL) {
            to = [ADMIN_EMAIL];
        } else {
            return new Response(JSON.stringify({ message: "Admin email skipped" }), { headers: corsHeaders });
        }
        
        const isPaid = data.amount > 0;
        subject = `[${isPaid ? 'PAYMENT' : 'ACTION REQUIRED'}] New Order: $${data.amount}`;
        
        html = `
          <div style="font-family: sans-serif; color: #333;">
            <h1 style="color: ${isPaid ? '#22c55e' : '#eab308'};">
                ${isPaid ? '💰 Payment Received' : '📝 New Request'}
            </h1>
            <ul style="list-style: none; padding: 0; font-size: 16px;">
                <li style="margin-bottom: 10px;"><strong>Client:</strong> ${data.userEmail}</li>
                <li style="margin-bottom: 10px;"><strong>Item:</strong> ${data.serviceTitle}</li>
                <li style="margin-bottom: 10px;"><strong>Value:</strong> <span style="font-weight: bold;">$${data.amount}</span></li>
            </ul>
            ${!isPaid ? '<p style="background-color: #fffbeb; padding: 10px; border: 1px solid #fcd34d; border-radius: 4px; color: #92400e;"><strong>Action Required:</strong> This is a custom request or free download. Please review the dashboard to set a price or manage the order.</p>' : ''}
            <a href="https://visionbuilt.in/admin" style="background-color: #1e293b; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Open Admin Panel</a>
            ${hiddenFooter}
          </div>
        `;
        break;

      case 'order_update':
        const statusPretty = data.status.replace('_', ' ').toUpperCase();
        subject = `Update on Order #${data.orderId.slice(0, 6)}: ${statusPretty}`;
        html = `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #06b6d4;">Status Update</h2>
             <p>Your order for <strong>${data.serviceTitle}</strong> has been updated.</p>
             <p><strong>New Status:</strong> <span style="background-color: #eee; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 14px;">${statusPretty}</span></p>
             <p>Log in to your dashboard to view details or chat with the developer.</p>
             <br/>
             <a href="https://visionbuilt.in/dashboard/order/${data.orderId}" style="background-color: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Order</a>
             ${hiddenFooter}
          </div>
        `;
        break;

      default:
        throw new Error('Invalid email type: ' + type);
    }

    // --- SEND VIA RESEND ---
    console.log(`Sending email [${type}] to [${to.join(', ')}] with ID: ${uniqueId}`);
    
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
