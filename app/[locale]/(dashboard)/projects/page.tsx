import Link from 'next/link';
import { unstable_setRequestLocale, getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

interface PageProps {
  params: { locale: string };
}

export default async function ProjectsPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('projects');
  const isArabic = locale === 'ar';

  // Fetch all projects with asset count
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      assets(count)
    `)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {t('title')}
          </h1>
          <p className="text-stone-500 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/projects/new`}>
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md">
            <PlusIcon className="h-4 w-4 me-2" />
            {t('new')}
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {!projects || projects.length === 0 ? (
        <Card className="border-dashed border-stone-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-4">
              <FolderIcon className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">
              {t('empty.title')}
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              {t('empty.description')}
            </p>
            <Link href={`/${locale}/dashboard/projects/new`}>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                {t('empty.cta')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const palette = project.palette as Record<string, string> | null;
            const assetCount = (project.assets as any)?.[0]?.count || 0;
            
            return (
              <Link 
                key={project.id} 
                href={`/${locale}/dashboard/projects/${project.id}`}
              >
                <Card className="group cursor-pointer border-stone-200 hover:border-indigo-200 hover:shadow-lg transition-all h-full">
                  {/* Color Preview Bar */}
                  <div className="h-2 rounded-t-lg flex overflow-hidden">
                    {palette && Object.values(palette).slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-1 text-stone-900 group-hover:text-indigo-600 transition-colors">
                          {isArabic && project.brand_name_ar 
                            ? project.brand_name_ar 
                            : project.brand_name}
                        </CardTitle>
                        {project.brand_name_ar && !isArabic && (
                          <p className="text-sm text-stone-500 font-arabic mt-0.5">
                            {project.brand_name_ar}
                          </p>
                        )}
                      </div>
                      <ArrowRightIcon className={`h-5 w-5 text-stone-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1 ${isArabic ? 'rotate-180' : ''}`} />
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {project.industry && (
                        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                          {t(`industries.${project.industry}`)}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">
                        {assetCount} {isArabic ? 'أصل' : assetCount === 1 ? 'asset' : 'assets'}
                      </span>
                      <span className="text-stone-400">
                        {formatDate(project.updated_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
