'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { signIn } from "next-auth/react";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get error from URL query parameters
  const error = searchParams.get("error");
  const errorMessage = error === "CredentialsSignin" 
    ? "Invalid email or password" 
    : error ? "An error occurred. Please try again." : localError;

  // This action handles the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setLocalError(result.error);
      } else if (result?.ok) {
        // Redirect to dashboard or callbackUrl
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
      }
    } catch (error) {
      setLocalError("An unexpected error occurred");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in to your account to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              required
              minLength={5}
            />
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}