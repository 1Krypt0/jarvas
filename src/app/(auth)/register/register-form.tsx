"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterForm({ callbackURL }: { callbackURL: string }) {
  const registerSchema = z
    .object({
      name: z.string().nonempty({ message: "Nome não pode estar vazio" }),
      email: z.string().email({ message: "Email inválido" }),
      password: z
        .string()
        .min(8, { message: "A password precisa de pelo menos 8 dígitos" }),
      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "As passwords têm de condizer",
      path: ["passwordConfirmation"],
    });

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL,
      fetchOptions: {
        onResponse: () => setLoading(false),
        onRequest: () => setLoading(true),
        onSuccess: () => {
          toast.success(
            "A sua conta foi registada com sucesso e um email de verificação foi enviado! Por favor, verifique a sua caixa de correio.",
            {
              duration: 8000,
            },
          );
        },
        onError: (ctx) => {
          if (ctx.error.message === "User already exists") {
            form.setError("email", {
              message: "Já existe uma conta com esse email",
            });
          }
          setLoading(false);
        },
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar uma Conta</CardTitle>
          <CardDescription>Crie conta com a Google</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.98em"
                  height="1em"
                  viewBox="0 0 256 262"
                >
                  <path
                    fill="#4285F4"
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  />
                  <path
                    fill="#34A853"
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  />
                  <path
                    fill="#FBBC05"
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                  />
                  <path
                    fill="#EB4335"
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  />
                </svg>
                Criar conta com a Google
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escreva o seu Nome aqui"
                        type="text"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escreva a sua Password aqui"
                        type="password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Confirme a sua Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escreva a Password novamente"
                        type="password"
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
                Criar Conta
              </Button>
              <div className="text-center text-sm">
                <p>
                  Já tem conta criada?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Faça Login
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground">
        Ao registar-se na plataforma, está a concordar com os nossos{" "}
        <Link
          target="_blank"
          href="https://askjarvas.com/terms-of-service"
          className="hover:text-primary underline underline-offset-4"
        >
          Termos de Serviço
        </Link>{" "}
        e a nossa{" "}
        <Link
          target="_blank"
          href="https://askjarvas.com/privacy-policy"
          className="hover:text-primary underline underline-offset-4"
        >
          Política de Privacidade
        </Link>
        .
      </div>
    </>
  );
}
