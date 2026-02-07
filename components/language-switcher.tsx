'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    // Replace the locale segment in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
    >
      <GlobeIcon className="w-4 h-4" />
      <span className="font-medium">
        {locale === 'en' ? 'العربية' : 'English'}
      </span>
    </Button>
  );
}

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const setLocale = (newLocale: 'en' | 'ar') => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('ar')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'ar'
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        عربي
      </button>
    </div>
  );
}
