import Link from 'next/link';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

// Icons
function FolderPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

interface PageProps {
  params: { locale: string };
}

export default async function DashboardPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('dashboard');
  const isArabic = locale === 'ar';

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch profile with explicit type
  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data as UserProfile | null;
  }

  // Fetch projects
  const { data: projects, count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(4);

  // Fetch recent assets
  const { data: assets, count: assetsCount } = await supabase
    .from('assets')
    .select('*, projects(brand_name, brand_name_ar)')
    .order('created_at', { ascending: false })
    .limit(6);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const trialsRemaining = 2 - (profile?.trial_generations_used || 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {profile?.full_name 
            ? t('welcome', { name: profile.full_name.split(' ')[0] })
            : t('welcomeDefault')
          }
        </h1>
        <p className="text-stone-500 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-500">
              {t('stats.projects')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-900">{projectsCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-500">
              {t('stats.assets')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-stone-900">{assetsCount || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-stone-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-stone-500">
              {profile?.plan === 'free' ? t('stats.trialsLeft') : t('stats.credits')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {profile?.plan === 'free' ? trialsRemaining : profile?.credits_balance || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/${locale}/dashboard/projects/new`}>
          <Card className="group cursor-pointer border-stone-200 hover:border-indigo-200 hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 group-hover:from-indigo-200 group-hover:to-violet-200 transition-colors">
                <FolderPlusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900">
                  {t('quickActions.newProject')}
                </h3>
                <p className="text-sm text-stone-500">
                  {isArabic 
                    ? 'ابدأ علامة تجارية جديدة'
                    : 'Start a new brand project'}
                </p>
              </div>
              <ArrowRightIcon className={`h-5 w-5 text-stone-400 group-hover:text-indigo-600 transition-colors ${isArabic ? 'rotate-180' : ''}`} />
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/dashboard/generate`}>
          <Card className="group cursor-pointer border-stone-200 hover:border-amber-200 hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900">
                  {t('quickActions.newLogo')}
                </h3>
                <p className="text-sm text-stone-500">
                  {isArabic 
                    ? 'أنشئ شعاراً بالذكاء الاصطناعي'
                    : 'Create a logo with AI'}
                </p>
              </div>
              <ArrowRightIcon className={`h-5 w-5 text-stone-400 group-hover:text-amber-600 transition-colors ${isArabic ? 'rotate-180' : ''}`} />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            {t('recentProjects.title')}
          </h2>
          {projects && projects.length > 0 && (
            <Link 
              href={`/${locale}/dashboard/projects`}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isArabic ? 'عرض الكل' : 'View all'}
            </Link>
          )}
        </div>

        {!projects || projects.length === 0 ? (
          <Card className="border-dashed border-stone-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderPlusIcon className="h-12 w-12 text-stone-300 mb-4" />
              <h3 className="font-medium text-stone-900 mb-1">
                {t('recentProjects.empty')}
              </h3>
              <p className="text-sm text-stone-500 mb-4">
                {t('recentProjects.emptyDescription')}
              </p>
              <Link href={`/${locale}/dashboard/projects/new`}>
                <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                  {t('recentProjects.createFirst')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/${locale}/dashboard/projects/${project.id}`}
              >
                <Card className="group cursor-pointer border-stone-200 hover:border-indigo-200 hover:shadow-md transition-all h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-1 text-stone-900 group-hover:text-indigo-600 transition-colors">
                      {isArabic && project.brand_name_ar 
                        ? project.brand_name_ar 
                        : project.brand_name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {project.industry || (isArabic ? 'غير محدد' : 'Not specified')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">
                        {formatDate(project.created_at)}
                      </span>
                      {project.palette && (
                        <div className="flex gap-1">
                          {Object.values(project.palette as Record<string, string>).slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              className="h-4 w-4 rounded-full border border-stone-200"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trial Banner for Free Users */}
      {profile?.plan === 'free' && trialsRemaining > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border-indigo-200">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div>
              <h3 className="font-semibold text-indigo-900">
                {isArabic 
                  ? `لديك ${trialsRemaining} تجربة مجانية متبقية`
                  : `You have ${trialsRemaining} free trial${trialsRemaining > 1 ? 's' : ''} remaining`}
              </h3>
              <p className="text-sm text-indigo-700">
                {isArabic 
                  ? 'جرب تصميم الشعارات بالذكاء الاصطناعي مجاناً'
                  : 'Try AI-powered logo design for free'}
              </p>
            </div>
            <Link href={`/${locale}/dashboard/projects/new`}>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 whitespace-nowrap shadow-md">
                {isArabic ? 'استخدم تجربتك المجانية' : 'Use Your Free Trial'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
