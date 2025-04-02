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
        .min(8, { message: "Your Password needs at least 8 characters" }),

      passwordConfirmation: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: "Passwords must match",
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
      toast.error("An unexpected error occurred. Please try again");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex w-full items-center justify-center px-4">
      <div className="flex flex-col gap-6 mx-auto max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your Password</CardTitle>
            <CardDescription>
              Enter your New Password and Confirm it.
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your new Password here"
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
                      <FormLabel>Confirm your Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm your new Password here"
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
                  Reset your Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
