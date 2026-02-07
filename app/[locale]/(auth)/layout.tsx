import Link from 'next/link';
import { unstable_setRequestLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';

interface AuthLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function AuthLayout({ children, params: { locale } }: AuthLayoutProps) {
  unstable_setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-indigo-50/30 to-violet-50/30">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              ت
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">Tasmim</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-screen items-center justify-center p-4">
        {children}
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-indigo-100/50 to-violet-100/50 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-amber-100/30 to-orange-100/30 blur-3xl" />
      </div>
    </div>
  );
}
