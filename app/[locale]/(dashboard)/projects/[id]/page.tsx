import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GenerateAssetButton } from '@/components/dashboard/generate-asset-button';
import { AssetGrid } from '@/components/dashboard/asset-grid';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Asset = Database['public']['Tables']['assets']['Row'];

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
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

interface PageProps {
  params: { locale: string; id: string };
}

export default async function ProjectDetailPage({ params: { locale, id } }: PageProps) {
  unstable_setRequestLocale(locale);
  
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('projects');
  const tAssets = await getTranslations('assets');
  const isArabic = locale === 'ar';

  // Fetch project
  const { data: projectData, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !projectData) {
    notFound();
  }
  
  const project = projectData as Project;

  // Fetch assets for this project
  const { data: assetsData } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });
  const assets = (assetsData || []) as Asset[];

  // Fetch user profile for credits info
  const { data: { user } } = await supabase.auth.getUser();
  let profile: UserProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data as UserProfile | null;
  }

  const palette = project.palette as Record<string, string> | null;
  const style = project.style as { mood?: string; complexity?: string } | null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link 
            href={`/${locale}/dashboard/projects`}
            className="mt-1 p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <ArrowLeftIcon className={`h-5 w-5 text-stone-500 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {isArabic && project.brand_name_ar ? project.brand_name_ar : project.brand_name}
            </h1>
            {project.brand_name_ar && !isArabic && (
              <p className="text-stone-500 font-arabic">{project.brand_name_ar}</p>
            )}
            {project.brand_name && isArabic && project.brand_name_ar && (
              <p className="text-stone-500">{project.brand_name}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {project.industry && (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {t(`industries.${project.industry}`)}
                </span>
              )}
              {style?.mood && (
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                  {t(`styles.${style.mood}`)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <GenerateAssetButton 
          projectId={id} 
          locale={locale}
          profile={profile}
        />
      </div>

      {/* Project Info Card */}
      <Card className="border-stone-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-stone-700">
            {isArabic ? 'ألوان العلامة' : 'Brand Colors'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {palette && Object.entries(palette).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-lg border border-stone-200 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <div>
                  <p className="text-xs font-medium text-stone-600 capitalize">{name}</p>
                  <p className="text-xs text-stone-400 font-mono">{color}</p>
                </div>
              </div>
            ))}
          </div>
          {project.description && (
            <p className="mt-4 text-sm text-stone-600">{project.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Assets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            {tAssets('title')}
          </h2>
          <span className="text-sm text-stone-500">
            {assets?.length || 0} {isArabic ? 'أصل' : 'assets'}
          </span>
        </div>

        {!assets || assets.length === 0 ? (
          <Card className="border-dashed border-stone-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 mb-4">
                <SparklesIcon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">
                {tAssets('empty.title')}
              </h3>
              <p className="text-sm text-stone-500 mb-6 max-w-sm">
                {isArabic 
                  ? 'أنشئ شعارك الأول بالذكاء الاصطناعي'
                  : 'Generate your first logo or brand asset using AI'}
              </p>
              <GenerateAssetButton 
                projectId={id} 
                locale={locale}
                profile={profile}
                variant="default"
              />
            </CardContent>
          </Card>
        ) : (
          <AssetGrid 
            assets={assets} 
            locale={locale}
            projectId={id}
          />
        )}
      </div>
    </div>
  );
}
