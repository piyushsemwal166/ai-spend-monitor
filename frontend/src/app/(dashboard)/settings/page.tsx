"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/services/authService";
import { useAuth } from "@/providers/auth-provider";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().email("Enter a valid email address."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Enter your current password."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const preferencesSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  notifications: z.enum(["all", "important", "off"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
type PreferencesValues = z.infer<typeof preferencesSchema>;

const PREFERENCES_KEY = "ai-spend-settings";

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "" },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const preferencesForm = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { theme: "system", notifications: "important", notes: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, email: user.email });
    }

    const storedPreferences = window.localStorage.getItem(PREFERENCES_KEY);
    if (storedPreferences) {
      try {
        preferencesForm.reset(JSON.parse(storedPreferences) as PreferencesValues);
      } catch {
        // ignore malformed local preferences
      }
    }
  }, [preferencesForm, profileForm, user]);

  const saveProfile = profileForm.handleSubmit(async (values) => {
    await toast.promise(authService.updateProfile(values), {
      loading: "Saving profile...",
      success: "Profile updated.",
      error: (error) => (error instanceof Error ? error.message : "Unable to update profile."),
    });
    await refreshProfile();
  });

  const changePassword = passwordForm.handleSubmit(async (values) => {
    await toast.promise(
      authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      {
        loading: "Updating password...",
        success: "Password changed.",
        error: (error) => (error instanceof Error ? error.message : "Unable to change password."),
      },
    );
    passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
  });

  const savePreferences = preferencesForm.handleSubmit(async (values) => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(values));
    toast.success("Preferences saved locally.");
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader eyebrow="Settings" title="Workspace settings" description="Update your profile, password, and local workspace preferences." />

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={saveProfile}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Name" error={profileForm.formState.errors.name?.message}>
                <Input placeholder="Alex Morgan" {...profileForm.register("name")} />
              </FormField>
              <FormField label="Email" error={profileForm.formState.errors.email?.message}>
                <Input type="email" placeholder="you@company.com" {...profileForm.register("email")} />
              </FormField>
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={changePassword}>
            <div className="grid gap-5 md:grid-cols-3">
              <FormField label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
                <Input type="password" {...passwordForm.register("currentPassword")} />
              </FormField>
              <FormField label="New password" error={passwordForm.formState.errors.newPassword?.message}>
                <Input type="password" {...passwordForm.register("newPassword")} />
              </FormField>
              <FormField label="Confirm password" error={passwordForm.formState.errors.confirmPassword?.message}>
                <Input type="password" {...passwordForm.register("confirmPassword")} />
              </FormField>
            </div>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Change password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/80 dark:bg-slate-950/60">
        <CardContent className="space-y-6 p-6">
          <form className="space-y-6" onSubmit={savePreferences}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Theme preference" error={preferencesForm.formState.errors.theme?.message}>
                <Select {...preferencesForm.register("theme")}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
              </FormField>
              <FormField label="Notification level" error={preferencesForm.formState.errors.notifications?.message}>
                <Select {...preferencesForm.register("notifications")}>
                  <option value="all">All</option>
                  <option value="important">Important only</option>
                  <option value="off">Off</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Notes" error={preferencesForm.formState.errors.notes?.message}>
              <Textarea placeholder="Add account-level notes or internal operating instructions." {...preferencesForm.register("notes")} />
            </FormField>
            <Button type="submit" disabled={preferencesForm.formState.isSubmitting}>
              {preferencesForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}