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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    rememberMe: z.boolean(),
  });

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
      fetchOptions: {
        onResponse: () => setLoading(false),
        onRequest: () => setLoading(true),
        onSuccess: () => router.push("/"),
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            form.setError("email", {
              message: "Please verify your email before you attempt to login.",
            });
          } else {
            form.setError("email", { message: "Invalid Email or Password." });
            form.setError("password", {
              message: "Invalid Email or Password.",
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
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Login with your Google Account</CardDescription>
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
                Login with Google
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="Enter your Email here"
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
                        Forgot your password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter your Password here"
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
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Remember Me
                    </FormLabel>
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
                  Don&apos;t have an occount?{" "}
                  <Link
                    href="/register"
                    className="underline underline-offset-4"
                  >
                    Register Now
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground">
        By entering the platform, you are agreeing with our{" "}
        <Link
          target="_blank"
          href="https://askjarvas.com/terms-of-service"
          className="hover:text-primary underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and our{" "}
        <Link
          target="_blank"
          href="https://askjarvas.com/privacy-policy"
          className="hover:text-primary underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </>
  );
}
