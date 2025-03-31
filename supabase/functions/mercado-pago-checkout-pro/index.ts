
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// Configurar headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Lidar com requisições preflight CORS
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
};

serve(async (req: Request) => {
  console.log("Edge function recebeu requisição:", req.method, req.url);
  
  // Lidar com CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Validar que a requisição é POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Obter o corpo da requisição
    const { courseId, courseTitle, coursePrice, backUrl, userId } = await req.json();

    // Validar campos obrigatórios
    if (!courseId || !courseTitle || !coursePrice || !userId) {
      console.error("Campos obrigatórios ausentes:", { courseId, courseTitle, coursePrice, userId });
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Obter token de acesso do Mercado Pago das variáveis de ambiente
    const mercadoPagoAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      console.error("Variável de ambiente MERCADO_PAGO_ACCESS_TOKEN não configurada");
      return new Response(JSON.stringify({ error: 'Configuração do provedor de pagamento ausente' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("Usando token de acesso do Mercado Pago:", mercadoPagoAccessToken.substring(0, 10) + "...");
    console.log("Criando checkout para o usuário ID:", userId);

    try {
      // Criar checkout via API direta do Mercado Pago (Checkout Pro)
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
          notification_url: `${backUrl}/api/mercado-pago-webhook`,
          // Configurações específicas do Checkout Pro
          payment_methods: {
            excluded_payment_types: [
              { id: "ticket" } // Exclui pagamentos em boleto se desejar
            ],
            installments: 12 // Permite parcelamento em até 12x
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resposta de erro do Mercado Pago:', response.status, JSON.stringify(errorData));
        return new Response(JSON.stringify({ 
          error: 'Falha ao criar preferência de pagamento',
          details: errorData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }

      const result = await response.json();
      console.log("Checkout criado com sucesso. URL:", result.init_point);

      return new Response(JSON.stringify({ 
        checkoutUrl: result.init_point,
        preferenceId: result.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (fetchError) {
      console.error('Erro ao criar checkout do Mercado Pago:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Falha ao conectar ao provedor de pagamento',
        details: fetchError.message 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
