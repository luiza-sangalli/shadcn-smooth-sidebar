
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  User, 
  CreditCard, 
  Receipt, 
  Building2, 
  Phone, 
  Mail, 
  Info 
} from "lucide-react";

const personalInfoSchema = z.object({
  fullName: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  socialName: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  whatsapp: z.string().min(10, { message: "Número de telefone inválido" }),
});

const invoiceSchema = z.object({
  documentType: z.enum(["cpf", "cnpj"]),
  documentNumber: z.string()
    .refine(val => {
      // Basic validation for CPF (11 digits) or CNPJ (14 digits)
      return (val.length === 11 || val.length === 14) && /^\d+$/.test(val);
    }, { message: "Documento inválido" }),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

const MyAccount = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");

  const personalForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.name || "",
      socialName: "",
      email: user?.email || "",
      whatsapp: "",
    },
  });

  const invoiceForm = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      documentType: "cpf",
      documentNumber: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const onPersonalSubmit = (values: z.infer<typeof personalInfoSchema>) => {
    toast({
      title: "Informações pessoais atualizadas",
      description: "Seus dados pessoais foram atualizados com sucesso.",
    });
    console.log(values);
  };

  const onInvoiceSubmit = (values: z.infer<typeof invoiceSchema>) => {
    toast({
      title: "Informações fiscais atualizadas",
      description: "Seus dados fiscais foram atualizados com sucesso.",
    });
    console.log(values);
  };

  const watchDocumentType = invoiceForm.watch("documentType");

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center gap-2">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Informações Pessoais</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Dados de Pagamento</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>Dados para Nota Fiscal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais aqui. Essas informações serão exibidas em sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...personalForm}>
                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6">
                  <FormField
                    control={personalForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personalForm.control}
                    name="socialName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Social (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={personalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <Input placeholder="seu@email.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalForm.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone WhatsApp</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Salvar Alterações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Pagamento</CardTitle>
              <CardDescription>
                Informações sobre seus pagamentos e assinaturas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">Método de Pagamento</h3>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span>Cartão de Crédito terminando em •••• 4242</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Expira em: 12/2025</p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">Assinatura Atual</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Plano Premium</p>
                      <p className="text-sm text-muted-foreground">Renovação em: 15/10/2023</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      Ativo
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-lg font-medium">Histórico de Pagamentos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">Plano Premium</p>
                        <p className="text-sm text-muted-foreground">15/09/2023</p>
                      </div>
                      <span>R$ 99,90</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">Plano Premium</p>
                        <p className="text-sm text-muted-foreground">15/08/2023</p>
                      </div>
                      <span>R$ 99,90</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Plano Premium</p>
                        <p className="text-sm text-muted-foreground">15/07/2023</p>
                      </div>
                      <span>R$ 99,90</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice">
          <Card>
            <CardHeader>
              <CardTitle>Dados para Nota Fiscal</CardTitle>
              <CardDescription>
                Forneça as informações necessárias para emissão de notas fiscais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-6">
                  <FormField
                    control={invoiceForm.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento</FormLabel>
                        <Select
                          onValueChange={(value: "cpf" | "cnpj") => {
                            field.onChange(value);
                            setDocumentType(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cpf">CPF (Pessoa Física)</SelectItem>
                            <SelectItem value="cnpj">CNPJ (Pessoa Jurídica)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={invoiceForm.control}
                    name="documentNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchDocumentType === "cpf" ? "CPF" : "CNPJ"}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={watchDocumentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchDocumentType === "cnpj" && (
                    <FormField
                      control={invoiceForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Nome da empresa" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Separator />
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={invoiceForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número, complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">Salvar Informações Fiscais</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyAccount;
