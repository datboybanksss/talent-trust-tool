import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, Mail, User, Briefcase, Building, Phone } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  displayName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Company name is required"),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["athlete_agent", "artist_manager"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

const AgentRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: "", email: "", password: "", confirmPassword: "",
      companyName: "", registrationNumber: "", phone: "", role: "athlete_agent",
    },
  });

  const { dashboardPath, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (user && !roleLoading && dashboardPath) {
      navigate(dashboardPath, { replace: true });
    }
  }, [user, roleLoading, dashboardPath, navigate]);

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message.includes("Invalid login credentials")
          ? "Invalid email or password."
          : "An error occurred during sign in.",
        variant: "destructive",
      });
    }
    // On success, the useEffect above routes to the correct dashboard once
    // useUserRole resolves (admin → /admin, agent/staff → /agent-dashboard).
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    // Sign up with agent role metadata
    const { error } = await signUp(data.email, data.password, data.displayName, data.role);
    
    if (error) {
      setIsLoading(false);
      toast({
        title: "Sign up failed",
        description: error.message.includes("already registered")
          ? "This email is already registered."
          : error.message,
        variant: "destructive",
      });
      return;
    }

    // We need to wait for the user to verify email, so store agent details for later
    // The agent profile will be created after email verification and first sign-in
    localStorage.setItem("pending_agent_profile", JSON.stringify({
      companyName: data.companyName,
      registrationNumber: data.registrationNumber,
      phone: data.phone,
      role: data.role,
    }));

    setIsLoading(false);
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account before signing in.",
    });
    setActiveTab("signin");
    signUpForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-forest-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Agent & Manager Portal</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your clients' profiles securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="space-y-4">
                <GoogleSignInButton />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                  </div>
                </div>
              </div>
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4 mt-4">
                  <FormField control={signInForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="email" placeholder="your@email.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signInForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4 mb-4">
                <GoogleSignInButton />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or register with email</span>
                  </div>
                </div>
              </div>
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField control={signUpForm.control} name="role" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3">
                          <Label htmlFor="athlete_agent" className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${field.value === "athlete_agent" ? "border-gold bg-gold/10 text-foreground" : "border-border hover:border-gold/50 text-muted-foreground"}`}>
                            <RadioGroupItem value="athlete_agent" id="athlete_agent" className="sr-only" />
                            <Shield className={`w-5 h-5 ${field.value === "athlete_agent" ? "text-gold" : ""}`} />
                            <span className="font-medium text-xs text-center">Athletes' Agent</span>
                          </Label>
                          <Label htmlFor="artist_manager" className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 cursor-pointer transition-all ${field.value === "artist_manager" ? "border-gold bg-gold/10 text-foreground" : "border-border hover:border-gold/50 text-muted-foreground"}`}>
                            <RadioGroupItem value="artist_manager" id="artist_manager" className="sr-only" />
                            <Briefcase className={`w-5 h-5 ${field.value === "artist_manager" ? "text-gold" : ""}`} />
                            <span className="font-medium text-xs text-center">Artists' Manager</span>
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="displayName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Your full name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Agency Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Your company name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="registrationNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Company registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="+27..." className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="email" placeholder="your@email.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signUpForm.control} name="confirmPassword" render={({ field }) => (
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
                  )} />
                  <p className="text-xs text-muted-foreground">
                    By registering, you agree to handle client data in compliance with POPIA regulations.
                    You will not have automatic access to client profiles after activation.
                  </p>
                  <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register as Agent/Manager"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => navigate("/")} className="text-muted-foreground">
              ← Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentRegister;
