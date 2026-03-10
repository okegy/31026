import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().min(3, 'Please enter a valid email or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, setDemoMode, isDemoMode, userRole } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user || isDemoMode) {
      if (userRole === 'patient') {
        navigate('/patient-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isDemoMode, userRole, navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ email: formData.email, password: formData.password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Demo Interception
    if (formData.email === 'doctor_demo' && formData.password === 'medicu123') {
      setDemoMode(true, 'doctor');
      toast({
        title: 'Welcome Doctor! 👨‍⚕️',
        description: 'Logging into Doctor Dashboard...',
      });
      return;
    }
    
    if (formData.email === 'patient_demo' && formData.password === 'medicu123') {
      setDemoMode(true, 'patient');
      toast({
        title: 'Welcome Patient! 👋',
        description: 'Logging into Patient Dashboard...',
      });
      return;
    }

    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Welcome back! 👋',
        description: 'MEDICU AI is ready to assist you.',
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message.includes('already registered') 
          ? 'This email is already registered. Try signing in instead.' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Account created! 🎉',
        description: 'Welcome to MEDICU AI. Let\'s get started!',
      });
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    toast({
      title: 'Demo Mode Activated ✨',
      description: 'Explore MEDICU AI with sample data. No account needed!',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner pt-0.5">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-blue-900 tracking-tight">MEDICU AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Next-Generation Medical Assistant
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="text"
                    placeholder="doctor_demo or you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full group border-dashed hover:border-primary/50 hover:bg-primary/5"
            onClick={handleDemoMode}
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary group-hover:animate-pulse" />
            Try Demo Mode
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Demo mode lets you explore MEDICU AI with sample data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
