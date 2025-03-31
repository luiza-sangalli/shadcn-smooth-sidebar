
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
  console.log("Webhook received: ", req.method, req.url);
  
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Get Mercado Pago access token
    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN environment variable not set");
      return new Response(JSON.stringify({ error: 'Payment provider configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials are not set");
      return new Response(JSON.stringify({ error: 'Database configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the webhook payload
    const body = await req.json();
    console.log("Webhook payload:", JSON.stringify(body));

    // Verify if this is a Mercado Pago webhook
    if (!body.action || !body.data || !body.data.id) {
      console.error("Invalid webhook payload");
      return new Response(JSON.stringify({ error: 'Invalid webhook payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Process only payment notifications
    if (body.action === "payment.updated" || body.action === "payment.created") {
      const paymentId = body.data.id;
      console.log(`Processing payment ${paymentId}`);

      // Get payment details from Mercado Pago API
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`
        }
      });

      if (!paymentResponse.ok) {
        console.error(`Failed to get payment details: ${paymentResponse.status}`);
        return new Response(JSON.stringify({ error: 'Failed to get payment details' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      const payment = await paymentResponse.json();
      console.log("Payment details:", JSON.stringify(payment));

      // Check if payment status is approved
      if (payment.status === "approved") {
        // Extract user and course information from external_reference
        // The reference format should be: email|courseId1,courseId2,...
        const externalReference = payment.external_reference;
        
        if (!externalReference || !externalReference.includes('|')) {
          console.error("Invalid external reference format");
          return new Response(JSON.stringify({ error: 'Invalid external reference format' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        const [email, courseIdsString] = externalReference.split('|');
        const courseIds = courseIdsString.split(',');
        
        if (!email || !courseIds.length) {
          console.error("Missing email or course IDs in external reference");
          return new Response(JSON.stringify({ error: 'Missing user or course information' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }

        // Look up the user by email
        const { data: users, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', email)
          .limit(1);

        if (userError) {
          console.error("Error looking up user:", userError);
          return new Response(JSON.stringify({ error: 'Database error looking up user' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        // If user doesn't exist, create a new one
        let userId;
        if (!users || users.length === 0) {
          // Create a new user with a random password
          const password = Math.random().toString(36).slice(-8);
          const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
          });

          if (signupError) {
            console.error("Error creating user:", signupError);
            return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            });
          }

          userId = newUser.user.id;
          
          // Optional: Send welcome email with password reset link
          // This would require an email service integration
        } else {
          userId = users[0].id;
        }

        // Grant access to each course by creating enrollment records
        for (const courseId of courseIds) {
          // Check if enrollment already exists
          const { data: existingEnrollment, error: checkError } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .limit(1);

          if (checkError) {
            console.error(`Error checking enrollment for course ${courseId}:`, checkError);
            continue; // Try the next course
          }

          // Skip if already enrolled
          if (existingEnrollment && existingEnrollment.length > 0) {
            console.log(`User ${userId} already enrolled in course ${courseId}`);
            continue;
          }

          // Create enrollment record
          const { error: enrollError } = await supabase
            .from('enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              purchased_at: new Date().toISOString()
            });

          if (enrollError) {
            console.error(`Error enrolling user ${userId} in course ${courseId}:`, enrollError);
          } else {
            console.log(`Successfully enrolled user ${userId} in course ${courseId}`);
          }
        }

        return new Response(JSON.stringify({ 
          success: true,
          message: `User ${email} granted access to ${courseIds.length} courses`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else {
        console.log(`Payment ${paymentId} is not approved, status: ${payment.status}`);
        return new Response(JSON.stringify({ 
          message: `Payment status is ${payment.status}, no action taken`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    } else {
      console.log(`Ignoring webhook action: ${body.action}`);
      return new Response(JSON.stringify({ 
        message: `Webhook action ${body.action} is not relevant, no action taken`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
