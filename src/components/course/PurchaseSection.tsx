
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePurchaseCourse } from "@/hooks/usePurchaseCourse";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

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
  const { purchaseCourse, isLoading, preferenceId } = usePurchaseCourse();

  // Initialize Mercado Pago SDK with the public key
  useEffect(() => {
    initMercadoPago('APP_USR-df416c28-3161-41c8-b118-11f6464dd3d5');
  }, []);

  // Create preference ID on component mount
  useEffect(() => {
    if (user && courseId && !isEnrolled && !preferenceId) {
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
          {preferenceId ? (
            // Customized Mercado Pago Wallet button 
            <Wallet 
              initialization={{ preferenceId: preferenceId }}
              customization={{
                texts: {
                  action: "buy", // Opções: "pay", "buy"
                  valueProp: "security" // Opções: "security", "speed", "practicality" 
                },
                visual: {
                  buttonBackground: "default", // "default", "black", "blue", "white"
                  borderRadius: "6px",
                  buttonHeight: "48px", // altura do botão
                  buttonPadding: "16px", // padding do botão
                  valuePropColor: "primary" // cor da prop de valor: "primary", "black", "white"
                },
                theme: {
                  headerColor: "#004bad",
                  elementsColor: "#004bad"
                }
              }}
            />
          ) : (
            // Show loading state while creating preference
            <div className="py-2">
              {isLoading ? 'Carregando opções de pagamento...' : 'Aguarde...'}
            </div>
          )}
        </>
      )}
    </div>
  );
};
