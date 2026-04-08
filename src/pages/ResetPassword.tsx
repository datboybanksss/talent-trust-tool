import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lock, Shield } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    // Supabase sets the session automatically from the recovery link hash
    supabase.auth.onAuthStateChange((event) => {
      console.log("[ResetPassword] Auth event:", event);
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Also check if we already have a session (user clicked link and landed here)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        // Wait a moment for the hash to be processed
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            setIsValidSession(!!s);
          });
        }, 1000);
      }
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    console.log("[ResetPassword] Updating password");
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setIsLoading(false);

    if (error) {
      console.error("[ResetPassword] Error:", error.message);
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
    navigate("/auth");
  };

  const handleRequestNewLink = () => {
    navigate("/auth");
    toast.info("Use 'Forgot password?' to request a new reset link.");
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <div className="animate-pulse text-muted-foreground">Verifying reset link...</div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">Link Expired</CardTitle>
            <CardDescription>
              This password reset link has expired or is invalid. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="gold" className="w-full" onClick={handleRequestNewLink}>
              Request a New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-forest-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
