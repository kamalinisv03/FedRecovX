import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, signIn, signUp } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email')?.toString() ?? "";
    const password = formData.get('password')?.toString() ?? "";
    const fullName = formData.get('full_name')?.toString() ?? "";

    let response;

    if (isLogin) {
      response = await signIn(email, password);
    } else {
      if (!fullName.trim()) {
        setError("Full name is required");
        setLoading(false);
        return;
      }
      response = await signUp(email, password, fullName);
    }

    if (response.error) {
      setError(response.error.message || "Authentication failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-primary p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
            <Shield className="h-10 w-10 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">FedRecovX</h1>
          <p className="text-lg text-primary-foreground/80">AI-Governed DCA Orchestration Platform</p>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center lg:hidden mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <Shield className="h-7 w-7 text-accent-foreground" />
            </div>
            <h1 className="text-2xl font-bold">FedRecovX</h1>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p className="text-muted-foreground">Enter your credentials to continue</p>
          </div>

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" required placeholder="John Doe" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-accent hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}