
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

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
    const { courseId, courseTitle, coursePrice, backUrl, userId } = await req.json();

    // Validate required fields
    if (!courseId || !courseTitle || !coursePrice || !userId) {
      console.error("Missing required fields:", { courseId, courseTitle, coursePrice, userId });
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
    console.log("Creating preference for user ID:", userId);

    // Create the preference using the Mercado Pago API since SDK is not compatible with Deno
    try {
      // Create preference via direct API call because SDK has compatibility issues with Deno
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
            id: userId
          },
          back_urls: {
            success: `${backUrl}/dashboard?status=approved&course_id=${courseId}`,
            failure: `${backUrl}/course/${courseId}?status=rejected`,
            pending: `${backUrl}/course/${courseId}?status=pending`
          },
          auto_return: 'approved',
          external_reference: `${userId}|${courseId}`,
          notification_url: `${backUrl}/api/mercado-pago-webhook`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from Mercado Pago:', response.status, JSON.stringify(errorData));
        return new Response(JSON.stringify({ 
          error: 'Failed to create payment preference',
          details: errorData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }

      const result = await response.json();
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
