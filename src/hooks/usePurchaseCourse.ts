
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function usePurchaseCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
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

      // Verificar se o preço está sendo passado corretamente
      if (coursePrice <= 0) {
        coursePrice = 1; // Define um valor mínimo para teste se o preço for zero
        console.log("Preço ajustado para:", coursePrice);
      }

      // Call the Mercado Pago Edge Function with the user ID
      const { data, error } = await supabase.functions.invoke('mercado-pago-checkout', {
        body: { 
          courseId, 
          courseTitle, 
          coursePrice,
          backUrl,
          userId: user.id // Pass the user ID directly from the context
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
      
      if (!data || !data.preferenceId) {
        console.error('Invalid response from payment server:', data);
        toast({
          title: "Erro",
          description: "Resposta inválida do servidor de pagamento. Contate o suporte.",
          variant: "destructive",
        });
        return null;
      }
      
      // Store the preference ID for the Mercado Pago checkout
      setPreferenceId(data.preferenceId);
      
      return data.preferenceId;
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
    preferenceId,
  };
}
