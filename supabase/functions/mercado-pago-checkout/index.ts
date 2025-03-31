
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";
import { MercadoPagoConfig, Preference } from "https://esm.sh/mercadopago@2.3.0";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
};

serve(async (req: Request) => {
  console.log("Edge function received request:", req.method, req.url);
  
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Validate that the request is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Get the request body
    const { courseId, courseTitle, coursePrice, backUrl } = await req.json();

    // Validate required fields
    if (!courseId || !courseTitle || !coursePrice) {
      console.error("Missing required fields:", { courseId, courseTitle, coursePrice });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get Mercado Pago access token from environment variables
    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN environment variable not set");
      return new Response(JSON.stringify({ error: 'Payment provider configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("Using Mercado Pago access token:", mercadoPagoAccessToken.substring(0, 10) + "...");

    // Get authorization from request
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get JWT token from authorization header (Bearer token)
    const token = authorization.replace('Bearer ', '');

    // Create Supabase client with the user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Get the user information
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log("Creating preference for user:", user.email);

    // Create the preference in Mercado Pago using the SDK
    try {
      // Initialize the SDK with the access token
      const client = new MercadoPagoConfig({ 
        accessToken: mercadoPagoAccessToken 
      });
      
      // Create a new preference instance
      const preference = new Preference(client);
      
      // Create the preference with the required information
      const preferenceData = {
        items: [
          {
            id: courseId,
            title: courseTitle,
            description: `Acesso ao curso: ${courseTitle}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(coursePrice)
          }
        ],
        payer: {
          email: user.email
        },
        back_urls: {
          success: `${backUrl}/dashboard?status=approved&course_id=${courseId}`,
          failure: `${backUrl}/course/${courseId}?status=rejected`,
          pending: `${backUrl}/course/${courseId}?status=pending`
        },
        auto_return: 'approved',
        external_reference: `${user.id}|${courseId}`,
        notification_url: `${backUrl}/api/mercado-pago-webhook` // This will be implemented later
      };
      
      const result = await preference.create({ body: preferenceData });
      console.log("Preference created successfully:", result.id);

      return new Response(JSON.stringify({ 
        preferenceId: result.id,
        initPoint: result.init_point
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (fetchError) {
      console.error('Error creating Mercado Pago preference:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to payment provider',
        details: fetchError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
