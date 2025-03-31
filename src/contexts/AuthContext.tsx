
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

// Extended User type that includes name
export interface User extends SupabaseUser {
  name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        
        // Set user with name from user_metadata if available
        if (newSession?.user) {
          const userData: User = {
            ...newSession.user,
            name: newSession.user.user_metadata?.name || newSession.user.email?.split('@')[0] || ''
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        
        // If we have a new session and the event is SIGNED_IN, show success message
        if (newSession && event === 'SIGNED_IN') {
          toast({
            title: "Sessão iniciada",
            description: `Bem-vindo, ${newSession.user.email}!`,
          });
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Checking existing session:", currentSession?.user?.id);
      setSession(currentSession);
      
      // Set user with name from user_metadata if available
      if (currentSession?.user) {
        const userData: User = {
          ...currentSession.user,
          name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || ''
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (!email || !password) {
        throw new Error("Por favor, insira email e senha");
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Falha no login",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      if (!name || !email || !password) {
        throw new Error("Por favor, preencha todos os campos");
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso",
        description: `Um email de confirmação foi enviado para ${email}. Por favor, verifique sua caixa de entrada.`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Falha no cadastro",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Verificar primeiro se o usuário está autenticado para evitar erros
      if (!user) {
        // Se não há usuário autenticado, apenas redirecione e limpe o estado
        setUser(null);
        setSession(null);
        navigate("/login", { replace: true });
        return;
      }
      
      // Tente fazer o logout
      const { error } = await supabase.auth.signOut();
      
      // Se houver erro com a sessão, ainda limpe o estado local e redirecione
      if (error && error.message.includes("Auth session missing")) {
        console.warn("Sessão ausente durante logout, limpando estado local:", error.message);
        setUser(null);
        setSession(null);
        navigate("/login", { replace: true });
        return;
      }
      
      // Para outros erros, lance uma exceção
      if (error) throw error;
      
      toast({
        title: "Sessão encerrada",
      });
      
      // Limpeza explícita dos estados
      setUser(null);
      setSession(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
      // Mesmo com erro, ainda tente limpar o estado e redirecionar
      setUser(null);
      setSession(null);
      
      toast({
        title: "Erro ao encerrar sessão",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      
      // Ainda redirecione para a página de login
      navigate("/login", { replace: true });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      if (!email) {
        throw new Error("Por favor, insira seu endereço de email");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email de redefinição enviado",
        description: "Verifique seu email para instruções de redefinição de senha",
      });
      
      navigate("/login");
    } catch (error) {
      toast({
        title: "Falha ao enviar email",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
