"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading, signUp } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      password: values.password,
    };

    await toast.promise(signUp(payload), {
      loading: "Creating your workspace...",
      success: "Your workspace is ready.",
      error: "Unable to register. Check the API connection.",
    });
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Card className="w-full max-w-lg border-white/10 bg-white/85 shadow-2xl shadow-slate-950/10 dark:bg-slate-950/70">
      <CardHeader className="space-y-3 text-center">
        <CardTitle className="font-display text-3xl">Create your account</CardTitle>
        <CardDescription>Start managing AI spend in a single premium workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <FormField label="Full name" error={errors.name?.message}>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Alex Morgan" className="pl-10" {...register("name")} />
            </div>
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="email" placeholder="you@company.com" className="pl-10" {...register("email")} />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="password" placeholder="••••••••" className="pl-10" {...register("password")} />
            </div>
          </FormField>

          <FormField label="Confirm password" error={errors.confirmPassword?.message}>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input type="password" placeholder="••••••••" className="pl-10" {...register("confirmPassword")} />
            </div>
          </FormField>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan-600 hover:text-cyan-500">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}