'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const INDUSTRIES = [
  'technology',
  'finance',
  'healthcare',
  'education',
  'retail',
  'food',
  'hospitality',
  'realestate',
  'media',
  'fashion',
  'other',
] as const;

const STYLES = [
  'modern',
  'minimal',
  'luxury',
  'playful',
  'corporate',
  'traditional',
  'bold',
  'elegant',
] as const;

const DEFAULT_COLORS = {
  primary: '#4f46e5',
  secondary: '#c6a962',
  accent: '#e5e7eb',
};

export default function NewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('projects');
  
  const locale = params.locale as string;
  const isArabic = locale === 'ar';

  const [brandName, setBrandName] = useState('');
  const [brandNameAr, setBrandNameAr] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('modern');
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      const result = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          brand_name: brandName,
          brand_name_ar: brandNameAr || null,
          industry: industry || null,
          description: description || null,
          style: { mood: style, complexity: 'minimal' },
          palette: colors,
        })
        .select()
        .single();

      if (result.error) throw result.error;
      if (!result.data) throw new Error('No data returned');

      const project = result.data as { id: string };
      router.push(`/${locale}/dashboard/projects/${project.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">
          {t('create.title')}
        </h1>
        <p className="text-stone-500 mt-1">
          {isArabic 
            ? 'أدخل تفاصيل علامتك التجارية لبدء التصميم'
            : 'Enter your brand details to start designing'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-stone-200">
          <CardContent className="space-y-6 pt-6">
            {/* Brand Name (English) */}
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-stone-700">
                {t('create.brandName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brandName"
                type="text"
                placeholder={t('create.brandNamePlaceholder')}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="h-11 border-stone-300 focus:border-indigo-500 focus:ring-indigo-500"
                dir="ltr"
              />
            </div>

            {/* Brand Name (Arabic) */}
            <div className="space-y-2">
              <Label htmlFor="brandNameAr" className="text-stone-700">
                {t('create.brandNameAr')}
              </Label>
              <Input
                id="brandNameAr"
                type="text"
                placeholder={t('create.brandNameArPlaceholder')}
                value={brandNameAr}
                onChange={(e) => setBrandNameAr(e.target.value)}
                className="h-11 border-stone-300 focus:border-indigo-500 focus:ring-indigo-500 font-arabic"
                dir="rtl"
              />
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-stone-700">
                {t('create.industry')}
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="h-11 border-stone-300">
                  <SelectValue placeholder={t('create.industryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {t(`industries.${ind}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="text-stone-700">{t('create.style')}</Label>
              <div className="grid grid-cols-4 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      style === s
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {t(`styles.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label className="text-stone-700">{t('create.colors')}</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-stone-500">{t('create.primaryColor')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <Input
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="h-10 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-500">{t('create.secondaryColor')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.secondary}
                      onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <Input
                      value={colors.secondary}
                      onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                      className="h-10 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-stone-500">Accent</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="h-10 w-10 rounded-lg border border-stone-200 cursor-pointer"
                    />
                    <Input
                      value={colors.accent}
                      onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                      className="h-10 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-stone-700">
                {t('create.description')}
              </Label>
              <textarea
                id="description"
                placeholder={t('create.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 border-stone-300"
                onClick={() => router.back()}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                disabled={isLoading || !brandName}
              >
                {isLoading ? (
                  <LoadingSpinner className="h-5 w-5" />
                ) : (
                  t('create.submit')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
