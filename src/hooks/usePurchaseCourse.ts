
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function usePurchaseCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const purchaseCourse = async (courseId: string, courseTitle: string, coursePrice: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar um curso.",
        variant: "destructive",
      });
      return null;
    }

    try {
      setIsLoading(true);

      // Obter a URL de origem atual (para back_urls)
      const backUrl = window.location.origin;

      console.log("Iniciando pagamento para curso:", courseId, courseTitle, coursePrice);

      // Verificar se o preço está sendo passado corretamente
      if (coursePrice <= 0) {
        coursePrice = 1; // Define um valor mínimo para teste se o preço for zero
        console.log("Preço ajustado para:", coursePrice);
      }

      // Chamar a Edge Function do Mercado Pago com o ID do usuário
      const { data, error } = await supabase.functions.invoke('mercado-pago-checkout-pro', {
        body: { 
          courseId, 
          courseTitle, 
          coursePrice,
          backUrl,
          userId: user.id
        },
      });

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return null;
      }
      
      // Registrar a resposta para depuração
      console.log("Resposta do servidor de pagamento:", data);
      
      if (!data || !data.checkoutUrl) {
        console.error('Resposta inválida do servidor de pagamento:', data);
        toast({
          title: "Erro",
          description: "Resposta inválida do servidor de pagamento. Contate o suporte.",
          variant: "destructive",
        });
        return null;
      }
      
      // Armazenar a URL de checkout do Mercado Pago
      setCheckoutUrl(data.checkoutUrl);
      
      return data.checkoutUrl;
    } catch (error) {
      console.error('Erro ao comprar curso:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    purchaseCourse,
    isLoading,
    checkoutUrl,
  };
}
