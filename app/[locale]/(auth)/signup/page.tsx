'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export default function SignupPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.signup');
  const tErrors = useTranslations('auth.errors');
  
  const locale = params.locale as string;
  const plan = searchParams.get('plan') || 'free';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validatePassword(password)) {
      setError(tErrors('weakPassword'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError(tErrors('emailInUse'));
        } else {
          setError(tErrors('generic'));
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(tErrors('generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (error) {
        setError(tErrors('generic'));
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError(tErrors('generic'));
      setIsGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md border-stone-200 shadow-xl shadow-stone-900/5">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckIcon className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            {locale === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
          </h2>
          <p className="text-stone-500 mb-6">
            {locale === 'ar' 
              ? `أرسلنا رابط تأكيد إلى ${email}` 
              : `We've sent a confirmation link to ${email}`}
          </p>
          <Button
            variant="outline"
            className="border-stone-300"
            onClick={() => setSuccess(false)}
          >
            {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-stone-200 shadow-xl shadow-stone-900/5">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-stone-900">
          {t('title')}
        </CardTitle>
        <CardDescription className="text-stone-500">
          {t('subtitle')}
        </CardDescription>
        {plan !== 'free' && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              {plan === 'starter' ? 'Starter Plan' : 'Pro Plan'}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Google Signup */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 border-stone-300 hover:bg-stone-50"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <LoadingSpinner className="h-5 w-5 me-2" />
          ) : (
            <GoogleIcon className="h-5 w-5 me-2" />
          )}
          {t('google')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-500">
              {locale === 'ar' ? 'أو' : 'or'}
            </span>
          </div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-stone-700">
              {t('fullName')}
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder={locale === 'ar' ? 'أحمد محمد' : 'John Doe'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 border-stone-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700">
              {t('email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-stone-300 focus:border-indigo-500 focus:ring-indigo-500"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">
              {t('password')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11 border-stone-300 focus:border-indigo-500 focus:ring-indigo-500"
              dir="ltr"
            />
            <p className="text-xs text-stone-500">
              {locale === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              t('submit')
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-stone-500">
          {t('terms')}
        </p>

        <p className="text-center text-sm text-stone-500">
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t('signIn')}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
