
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseCourse } from "@/hooks/usePurchaseCourse";

interface PurchaseSectionProps {
  isEnrolled: boolean;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
}

export const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  isEnrolled,
  courseId,
  courseTitle,
  coursePrice,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { purchaseCourse, isLoading, checkoutUrl } = usePurchaseCourse();

  // Create checkout URL on component mount
  useEffect(() => {
    if (user && courseId && !isEnrolled && !checkoutUrl) {
      handlePurchaseCourse();
    }
  }, [user, courseId, isEnrolled]);

  const handlePurchaseCourse = async () => {
    if (!user) {
      toast({
        title: "Aviso",
        description: "Você precisa estar logado para comprar este curso.",
        variant: "destructive",
      });
      return;
    }

    await purchaseCourse(
      courseId,
      courseTitle,
      Number(coursePrice)
    );
  };

  return (
    <div className="mt-4">
      {isEnrolled ? (
        <Button className="w-full md:w-auto">
          <Play className="mr-2 h-4 w-4" />
          Continuar Assistindo
        </Button>
      ) : (
        <>
          {checkoutUrl ? (
            // Botão para redirecionar para o Checkout Pro
            <Button 
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700" 
              onClick={() => window.open(checkoutUrl, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Comprar com Mercado Pago
            </Button>
          ) : (
            // Mostrar estado de loading enquanto cria checkout
            <div className="py-2">
              {isLoading ? 'Carregando opções de pagamento...' : 'Aguarde...'}
            </div>
          )}
        </>
      )}
    </div>
  );
};
