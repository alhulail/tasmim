'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface GenerateAssetButtonProps {
  projectId: string;
  locale: string;
  profile: UserProfile | null;
  variant?: 'default' | 'outline';
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
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

const ASSET_TYPES = [
  { value: 'logo', labelEn: 'Logo', labelAr: 'شعار' },
  { value: 'icon', labelEn: 'Icon', labelAr: 'أيقونة' },
  { value: 'wordmark', labelEn: 'Wordmark', labelAr: 'علامة نصية' },
  { value: 'pattern', labelEn: 'Pattern', labelAr: 'نمط' },
  { value: 'favicon', labelEn: 'Favicon', labelAr: 'أيقونة الموقع' },
  { value: 'social_post', labelEn: 'Social Post', labelAr: 'منشور اجتماعي' },
] as const;

export function GenerateAssetButton({ 
  projectId, 
  locale, 
  profile,
  variant = 'default' 
}: GenerateAssetButtonProps) {
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState<string>('logo');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const isFree = profile?.plan === 'free';
  const trialsUsed = profile?.trial_generations_used || 0;
  const trialsRemaining = 2 - trialsUsed;
  const creditsRemaining = profile?.credits_balance || 0;

  const canGenerate = isFree ? trialsRemaining > 0 : creditsRemaining > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          assetType,
          additionalPrompt: additionalPrompt || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className={variant === 'default' 
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md'
            : ''
          }
          variant={variant}
        >
          <SparklesIcon className="h-4 w-4 me-2" />
          {isArabic ? 'إنشاء أصل' : 'Generate Asset'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isArabic ? 'إنشاء أصل جديد' : 'Generate New Asset'}</DialogTitle>
          <DialogDescription>
            {isArabic 
              ? 'اختر نوع الأصل وأضف تعليمات إضافية إذا أردت'
              : 'Choose an asset type and add any additional instructions'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Asset Type Selection */}
          <div className="space-y-2">
            <Label>{isArabic ? 'نوع الأصل' : 'Asset Type'}</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {isArabic ? type.labelAr : type.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Prompt */}
          <div className="space-y-2">
            <Label>{isArabic ? 'تعليمات إضافية (اختياري)' : 'Additional Instructions (optional)'}</Label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder={isArabic 
                ? 'مثال: أريد تصميم عصري مع ألوان متدرجة...'
                : 'e.g., I want a modern design with gradient colors...'}
              rows={3}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Credits Info */}
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">
                {isArabic ? 'التكلفة:' : 'Cost:'}
              </span>
              <span className="font-medium text-stone-900">
                {isFree 
                  ? (isArabic ? '1 تجربة مجانية' : '1 free trial')
                  : (isArabic ? '1 رصيد' : '1 credit')}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-stone-600">
                {isArabic ? 'المتبقي:' : 'Remaining:'}
              </span>
              <span className={`font-medium ${canGenerate ? 'text-indigo-600' : 'text-red-600'}`}>
                {isFree 
                  ? `${trialsRemaining}/2 ${isArabic ? 'تجارب' : 'trials'}`
                  : `${creditsRemaining} ${isArabic ? 'رصيد' : 'credits'}`}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* No Credits Warning */}
          {!canGenerate && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
              {isFree
                ? (isArabic 
                    ? 'استخدمت جميع التجارب المجانية. قم بالترقية للمتابعة.'
                    : 'You\'ve used all free trials. Upgrade to continue.')
                : (isArabic
                    ? 'لا يوجد رصيد كافٍ. قم بشراء المزيد للمتابعة.'
                    : 'No credits remaining. Purchase more to continue.')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              type="button"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              onClick={handleGenerate}
              disabled={isGenerating || !canGenerate}
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="h-4 w-4 me-2" />
                  {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 me-2" />
                  {isArabic ? 'إنشاء' : 'Generate'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
