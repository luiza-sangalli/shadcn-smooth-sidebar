
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function usePurchaseCourse() {
  const [isLoading, setIsLoading] = useState(false);
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

      // Get the current URL origin (for back_urls)
      const backUrl = window.location.origin;

      console.log("Iniciando pagamento para curso:", courseId, courseTitle, coursePrice);

      // Call the Mercado Pago Edge Function
      const { data, error } = await supabase.functions.invoke('mercado-pago-checkout', {
        body: { 
          courseId, 
          courseTitle, 
          coursePrice,
          backUrl 
        },
      });

      if (error) {
        console.error('Error creating payment:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar o pagamento. Tente novamente mais tarde.",
          variant: "destructive",
        });
        return null;
      }
      
      // Log the response for debugging
      console.log("Resposta do servidor de pagamento:", data);
      
      // Handle specific error case: cannot pay yourself
      if (data?.error === 'self_payment_not_allowed') {
        toast({
          title: "Pagamento não permitido",
          description: data.message || "Não é possível comprar seu próprio curso. Use outra conta para fazer o pagamento.",
          variant: "destructive",
        });
        return null;
      }
      
      if (!data || !data.initPoint) {
        console.error('Invalid response from payment server:', data);
        toast({
          title: "Erro",
          description: "Resposta inválida do servidor de pagamento. Contate o suporte.",
          variant: "destructive",
        });
        return null;
      }
      
      return data.initPoint;
    } catch (error) {
      console.error('Error purchasing course:', error);
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
  };
}
