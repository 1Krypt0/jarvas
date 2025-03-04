"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function ForgetPasswordPage() {
  const passwordResetSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (values: z.infer<typeof passwordResetSchema>) => {
    setLoading(true);

    try {
      const res = await authClient.forgetPassword({
        email: values.email,
        redirectTo: "/reset-password",
      });

      if (res.error) {
        toast.error("Ocorreu um erro, por favor tente novamente.");
        console.error("Error:", res.error);
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro, por favor tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex w-full items-center justify-center px-4">
        <div className="flex flex-col gap-6 mx-auto max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Verifique o seu email</CardTitle>
              <CardDescription>
                Enviamos um email para repor a password.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertDescription>
                  Se não encontrar o email, verifique no spam.
                </AlertDescription>
              </Alert>

              <Button asChild>
                <Link href="/login">Voltar ao login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reponha a password</CardTitle>
            <CardDescription>
              Escreva o seu email para repor a password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="Escreva o seu email aqui"
                          type="email"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Enviar link de recuperação
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
