'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLogin, useRedirectIfAuthenticated } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Redirect if already authenticated
  useRedirectIfAuthenticated('/');

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/';

  // Login mutation
  const loginMutation = useLogin({
    onSuccess: () => {
      router.push(redirectTo);
    },
    onError: (error) => {
      setServerError(
        error.message || 'Login failed. Please check your credentials.'
      );
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const rememberValue = watch('remember');

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    loginMutation.mutate({
      username: data.username,
      password: data.password,
      remember: data.remember,
    });
  };

  // Clear server error when user types
  useEffect(() => {
    setServerError(null);
  }, [watch('username'), watch('password')]);

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Server Error */}
          {serverError && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{serverError}</p>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username or Email</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              disabled={isLoading}
              {...register('username')}
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberValue}
              onCheckedChange={(checked) =>
                setValue('remember', checked === true)
              }
              disabled={isLoading}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Demo Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium">Username:</span> demo
              </p>
              <p>
                <span className="font-medium">Password:</span> demo123
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
