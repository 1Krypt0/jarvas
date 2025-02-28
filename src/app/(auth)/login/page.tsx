"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onResponse: () => setLoading(false),
        onRequest: () => setLoading(true),
        onSuccess: () => router.push("/app"),
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            form.setError("email", {
              message: "Por favor, verifique o seu email antes de fazer login.",
            });
          } else {
            form.setError("email", { message: "Email ou password inválidos." });
            form.setError("password", {
              message: "Email ou password inválidos.",
            });
          }
          setLoading(false);
        },
      },
    });
  };

  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bem vindo de volta</CardTitle>
            {/* <CardDescription> */}
            {/*   Entre com a sua conta Google ou Apple */}
            {/* </CardDescription> */}
          </CardHeader>
          <CardContent>
            {/* <div className="grid gap-6"> */}
            {/*   <div className="flex flex-col gap-4"> */}
            {/*     <Button variant="outline" className="w-full"> */}
            {/*       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> */}
            {/*         <path */}
            {/*           d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" */}
            {/*           fill="currentColor" */}
            {/*         /> */}
            {/*       </svg> */}
            {/*       Entrar com a Apple */}
            {/*     </Button> */}
            {/*     <Button variant="outline" className="w-full"> */}
            {/*       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> */}
            {/*         <path */}
            {/*           d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" */}
            {/*           fill="currentColor" */}
            {/*         /> */}
            {/*       </svg> */}
            {/*       Entrar com a Google */}
            {/*     </Button> */}
            {/*   </div> */}
            {/*   <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"> */}
            {/*     <span className="relative z-10 bg-card px-2 text-muted-foreground"> */}
            {/*       Ou continue com */}
            {/*     </span> */}
            {/*   </div> */}
            {/* </div> */}
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="ml-auto text-sm underline-offset-4 underline"
                        >
                          Esqueceu-se da password?
                        </Link>
                      </div>
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
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Login
                </Button>
                <div className="text-center text-sm">
                  <p>
                    Ainda não tem conta?{" "}
                    <Link
                      href="/register"
                      className="underline underline-offset-4"
                    >
                      Registe-se já
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-balance text-center text-xs text-muted-foreground">
          Ao entrar na plataforma, está a concordar com os nossos{" "}
          <Link
            href="/terms-of-service"
            className="hover:text-primary underline underline-offset-4"
          >
            Termos de Serviço
          </Link>{" "}
          e a nossa{" "}
          <Link
            href="/privacy-policy"
            className="hover:text-primary underline underline-offset-4"
          >
            Política de Privacidade
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
