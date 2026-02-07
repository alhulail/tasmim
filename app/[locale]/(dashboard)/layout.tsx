import Link from 'next/link';
import { redirect } from 'next/navigation';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { createServerSupabaseClient, getUserProfile } from '@/lib/supabase/server';
import { LanguageToggle } from '@/components/language-switcher';
import { UserMenu } from '@/components/dashboard/user-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function CogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export default async function DashboardLayout({ children, params: { locale } }: DashboardLayoutProps) {
  unstable_setRequestLocale(locale);
  
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const profile = await getUserProfile();
  const t = await getTranslations('nav');
  const isArabic = locale === 'ar';

  const navigation = [
    { name: t('dashboard'), href: `/${locale}/dashboard`, icon: HomeIcon },
    { name: t('projects'), href: `/${locale}/dashboard/projects`, icon: FolderIcon },
    { name: t('settings'), href: `/${locale}/dashboard/settings`, icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 z-50 w-64 bg-white border-e border-stone-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-100">
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              ت
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">Tasmim</span>
          </Link>
        </div>

        {/* Create button */}
        <div className="p-4">
          <Link href={`/${locale}/dashboard/projects/new`}>
            <button className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 transition-all">
              <PlusIcon className="h-5 w-5" />
              <span>{isArabic ? 'مشروع جديد' : 'New Project'}</span>
            </button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Credits display */}
        <div className="p-4 border-t border-stone-100">
          <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-stone-700">
                {isArabic ? 'الرصيد' : 'Credits'}
              </span>
              <span className="text-sm font-bold text-indigo-600">
                {profile?.plan === 'free' 
                  ? `${2 - (profile?.trial_generations_used || 0)}/2`
                  : profile?.credits_balance || 0
                }
              </span>
            </div>
            <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all"
                style={{ 
                  width: profile?.plan === 'free' 
                    ? `${((2 - (profile?.trial_generations_used || 0)) / 2) * 100}%`
                    : `${Math.min((profile?.credits_balance || 0) / 50 * 100, 100)}%`
                }}
              />
            </div>
            {profile?.plan === 'free' && (
              <Link 
                href={`/${locale}/dashboard/settings?tab=billing`}
                className="block mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {isArabic ? 'ترقية الخطة' : 'Upgrade Plan'}
              </Link>
            )}
          </div>
        </div>

        {/* Language toggle */}
        <div className="p-4 border-t border-stone-100">
          <LanguageToggle />
        </div>
      </aside>

      {/* Main content */}
      <div className="ps-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-end px-6">
          <UserMenu user={user} profile={profile} locale={locale} />
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
