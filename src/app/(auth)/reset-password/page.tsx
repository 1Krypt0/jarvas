"use client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function ForgetPasswordPage() {
  const newPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, { message: "A password precisa de pelo menos 8 dígitos" }),

      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "As passwords têm de condizer",
      path: ["passwordConfirmation"],
    });

  const form = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof newPasswordSchema>) => {
    setLoading(true);

    const res = await authClient.resetPassword({
      newPassword: values.password,
      token: new URLSearchParams(window.location.search).get("token")!,
    });

    setLoading(false);

    if (res.error) {
      console.error(res.error.message);
      toast.error("Ocorreu um erro. Por favor, tente novamente.");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reponha a password</CardTitle>
            <CardDescription>
              Escreva a sua nova password e confirme-a.
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
                  Reponha a Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
