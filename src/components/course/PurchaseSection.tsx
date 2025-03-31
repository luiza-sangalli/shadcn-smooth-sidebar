
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

interface PurchaseSectionProps {
  isEnrolled: boolean;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  isLoading: boolean;
  preferenceId: string | null;
  onPurchase: () => Promise<void>;
}

export const PurchaseSection: React.FC<PurchaseSectionProps> = ({
  isEnrolled,
  courseId,
  courseTitle,
  coursePrice,
  isLoading,
  preferenceId,
  onPurchase,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize Mercado Pago SDK with the public key
  useEffect(() => {
    initMercadoPago('APP_USR-df416c28-3161-41c8-b118-11f6464dd3d5');
  }, []);

  return (
    <div>
      {isEnrolled ? (
        <Button className="w-full md:w-auto">
          <Play className="mr-2 h-4 w-4" />
          Continuar Assistindo
        </Button>
      ) : (
        <>
          {preferenceId ? (
            <div className="mt-4">
              {/* Container div for Mercado Pago Wallet */}
              <div id="wallet_container"></div>
              
              <Wallet 
                initialization={{ preferenceId: preferenceId }} 
                customization={{ texts: { action: "buy", valueProp: "practicality" } }}
              />
            </div>
          ) : (
            <Button 
              className="w-full md:w-auto" 
              onClick={onPurchase}
              disabled={isLoading}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {isLoading ? 'Processando...' : `Comprar Curso por R$ ${Number(coursePrice).toFixed(2)}`}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
