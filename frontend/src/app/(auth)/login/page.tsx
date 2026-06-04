"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await toast.promise(signIn(values), {
      loading: "Signing you in...",
      success: "Welcome back to AI Spend OS.",
      error: "Unable to sign in. Check the API connection.",
    });
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Card className="w-full max-w-lg border-white/10 bg-white/85 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/70">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="font-display text-3xl">Welcome back</CardTitle>
        <CardDescription>Log in to monitor AI spend across your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <FormField label="Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="email" placeholder="you@company.com" className="pl-10" {...register("email")} />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password?.message} hint="Minimum 8 characters">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="password" placeholder="••••••••" className="pl-10" {...register("password")} />
            </div>
          </FormField>

          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-cyan-600" {...register("rememberMe")} />
              Remember me
            </label>
            <Link href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-cyan-600 hover:text-cyan-500">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}