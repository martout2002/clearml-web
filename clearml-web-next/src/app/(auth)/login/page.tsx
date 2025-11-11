'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2, User } from 'lucide-react';
import { useLogin, useRedirectIfAuthenticated } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Login form validation schema - just requires a name
 */
const loginSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        error.message || 'Failed to create user. Please try again.'
      );
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    // Use environment credentials with the provided name
    const envKey = process.env.NEXT_PUBLIC_CLEARML_ACCESS_KEY;
    const envSecret = process.env.NEXT_PUBLIC_CLEARML_SECRET_KEY;

    if (!envKey || !envSecret) {
      setServerError('ClearML credentials not configured. Please check .env.local');
      return;
    }

    loginMutation.mutate({
      access_key: envKey,
      secret_key: envSecret,
      name: data.name,
      remember: true,
    });
  };

  // Clear server error when user types
  useEffect(() => {
    setServerError(null);
  }, [watch('name')]);

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome to ClearML</CardTitle>
        <CardDescription>
          Enter your name to get started
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

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              autoFocus
              disabled={isLoading}
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
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
                Getting started...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>

        {/* Info Text */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Your user will be automatically created on the ClearML server
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
