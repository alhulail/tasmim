'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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

const PLANS = [
  {
    id: 'free',
    name: { en: 'Free', ar: 'مجاني' },
    price: { en: 'Free', ar: 'مجاني' },
    credits: { en: '2 trials', ar: '2 تجارب' },
    features: {
      en: ['2 free logo generations', 'Watermarked downloads', 'Basic PNG export'],
      ar: ['2 إنشاء شعار مجاني', 'تحميلات بعلامة مائية', 'تصدير PNG أساسي'],
    },
  },
  {
    id: 'starter',
    name: { en: 'Starter', ar: 'المبتدئ' },
    price: { en: '$19/mo', ar: '$19/شهرياً' },
    credits: { en: '15 credits/mo', ar: '15 رصيد/شهرياً' },
    features: {
      en: ['15 credits monthly', 'No watermarks', 'PNG & SVG exports', 'All asset types'],
      ar: ['15 رصيد شهرياً', 'بدون علامة مائية', 'تصدير PNG و SVG', 'جميع أنواع الأصول'],
    },
  },
  {
    id: 'pro',
    name: { en: 'Pro', ar: 'احترافي' },
    price: { en: '$49/mo', ar: '$49/شهرياً' },
    credits: { en: '50 credits/mo', ar: '50 رصيد/شهرياً' },
    features: {
      en: ['50 credits monthly', 'Source files (Figma/AI)', 'Designer consultation', 'Priority support'],
      ar: ['50 رصيد شهرياً', 'ملفات المصدر (Figma/AI)', 'استشارة مصمم', 'دعم ذو أولوية'],
    },
    popular: true,
  },
];

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const locale = params.locale as string;
  const isArabic = locale === 'ar';
  const defaultTab = searchParams.get('tab') || 'profile';

  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createClient();

  // Load profile on mount
  useState(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
        }
      }
    };
    loadProfile();
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: isArabic ? 'تم الحفظ' : 'Saved',
        description: isArabic ? 'تم تحديث ملفك الشخصي' : 'Your profile has been updated',
      });
    } catch (err) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: isArabic ? 'فشل في الحفظ' : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    // TODO: Integrate Stripe checkout
    toast({
      title: isArabic ? 'قريباً' : 'Coming Soon',
      description: isArabic ? 'الدفع سيكون متاحاً قريباً' : 'Payment integration coming soon',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {isArabic ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-stone-500 mt-1">
          {isArabic ? 'إدارة حسابك واشتراكك' : 'Manage your account and subscription'}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="bg-stone-100 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white">
            {isArabic ? 'الملف الشخصي' : 'Profile'}
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-white">
            {isArabic ? 'الفوترة' : 'Billing'}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>{isArabic ? 'معلومات الملف الشخصي' : 'Profile Information'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {isArabic ? 'الاسم الكامل' : 'Full Name'}
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isArabic ? 'أدخل اسمك' : 'Enter your name'}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    value={profile?.email || ''}
                    disabled
                    className="max-w-md bg-stone-50"
                  />
                  <p className="text-xs text-stone-500">
                    {isArabic ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                  {isLoading ? (
                    <LoadingSpinner className="h-4 w-4 me-2" />
                  ) : null}
                  {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>{isArabic ? 'إحصائيات الحساب' : 'Account Stats'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">
                    {isArabic ? 'الخطة الحالية' : 'Current Plan'}
                  </p>
                  <p className="text-xl font-bold text-stone-900 capitalize">
                    {profile?.plan || 'free'}
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">
                    {isArabic ? 'الرصيد المتبقي' : 'Credits Remaining'}
                  </p>
                  <p className="text-xl font-bold text-indigo-600">
                    {profile?.plan === 'free'
                      ? `${2 - (profile?.trial_generations_used || 0)}/2`
                      : profile?.credits_balance || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">
                    {isArabic ? 'عضو منذ' : 'Member Since'}
                  </p>
                  <p className="text-xl font-bold text-stone-900">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(locale)
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'border-stone-200'
                } ${profile?.plan === plan.id ? 'ring-2 ring-indigo-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-medium text-white">
                      {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">
                    {plan.name[isArabic ? 'ar' : 'en']}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-stone-900">
                      {plan.price[isArabic ? 'ar' : 'en']}
                    </span>
                  </div>
                  <CardDescription>
                    {plan.credits[isArabic ? 'ar' : 'en']}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features[isArabic ? 'ar' : 'en'].map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                        <span className="text-stone-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {profile?.plan === plan.id ? (
                    <Button disabled className="w-full" variant="outline">
                      {isArabic ? 'الخطة الحالية' : 'Current Plan'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.id === 'free'
                        ? (isArabic ? 'الرجوع للمجاني' : 'Downgrade')
                        : (isArabic ? 'ترقية' : 'Upgrade')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment History */}
          <Card className="border-stone-200">
            <CardHeader>
              <CardTitle>{isArabic ? 'سجل الدفعات' : 'Payment History'}</CardTitle>
              <CardDescription>
                {isArabic ? 'عرض فواتيرك السابقة' : 'View your past invoices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-stone-500">
                {isArabic ? 'لا توجد دفعات بعد' : 'No payments yet'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
