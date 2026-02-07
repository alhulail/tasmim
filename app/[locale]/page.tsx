import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/language-switcher';

// Icons as components
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
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

export default async function LandingPage({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('landing');
  const isArabic = locale === 'ar';

  const features = [
    {
      icon: SparklesIcon,
      title: t('features.ai.title'),
      description: t('features.ai.description'),
    },
    {
      icon: GlobeIcon,
      title: t('features.arabic.title'),
      description: t('features.arabic.description'),
    },
    {
      icon: PaletteIcon,
      title: t('features.editor.title'),
      description: t('features.editor.description'),
    },
  ];

  const plans = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      description: t('pricing.free.description'),
      features: [
        t('pricing.free.features.0'),
        t('pricing.free.features.1'),
        t('pricing.free.features.2'),
      ],
      cta: t('pricing.free.cta'),
      href: `/${locale}/signup`,
      highlighted: false,
    },
    {
      name: t('pricing.starter.name'),
      price: '$19',
      period: t('pricing.perMonth'),
      description: t('pricing.starter.description'),
      features: [
        t('pricing.starter.features.0'),
        t('pricing.starter.features.1'),
        t('pricing.starter.features.2'),
        t('pricing.starter.features.3'),
      ],
      cta: t('pricing.starter.cta'),
      href: `/${locale}/signup?plan=starter`,
      highlighted: false,
    },
    {
      name: t('pricing.pro.name'),
      price: '$49',
      period: t('pricing.perMonth'),
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.features.0'),
        t('pricing.pro.features.1'),
        t('pricing.pro.features.2'),
        t('pricing.pro.features.3'),
        t('pricing.pro.features.4'),
      ],
      cta: t('pricing.pro.cta'),
      href: `/${locale}/signup?plan=pro`,
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              ت
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">Tasmim</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href={`/${locale}/signup`}>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20">
                {t('nav.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-stone-600">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            <span className="block">{t('hero.title.line1')}</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('hero.title.line2')}
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/${locale}/signup`}>
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
                {t('hero.cta.primary')}
                <ArrowRightIcon className={`ms-2 h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-stone-300 text-stone-700 hover:bg-stone-100">
                {t('hero.cta.secondary')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-stone-400 font-medium">tasmim.ai</span>
              </div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 flex items-center justify-center p-12">
              <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white shadow-lg flex items-center justify-center border border-stone-100">
                    <div className={`text-4xl font-bold ${i === 1 ? 'text-indigo-600' : i === 2 ? 'text-violet-600' : 'text-purple-600'}`}>
                      ت
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-stone-200 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-stone-200 bg-stone-50/50 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-stone-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-t border-stone-200 bg-stone-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">
              {t('pricing.title')}
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              {t('pricing.subtitle')}
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col ${
                  plan.highlighted 
                    ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105' 
                    : 'border-stone-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 text-xs font-medium text-white shadow-md">
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl text-stone-900">{plan.name}</CardTitle>
                  <CardDescription className="text-stone-500">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-stone-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-stone-500">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <CheckIcon className="h-5 w-5 shrink-0 text-indigo-600 mt-0.5" />
                        <span className="text-sm text-stone-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={plan.href} className="w-full">
                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md' 
                          : 'bg-stone-900 hover:bg-stone-800'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-indigo-200 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-indigo-100">
            {t('cta.subtitle')}
          </p>
          <Link href={`/${locale}/signup`}>
            <Button 
              size="lg" 
              className="mt-8 h-12 px-8 bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl"
            >
              {t('cta.button')}
              <ArrowRightIcon className={`ms-2 h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold shadow-sm">
                ت
              </div>
              <span className="text-lg font-bold text-stone-900">Tasmim</span>
            </div>
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} Tasmim. {t('footer.rights')}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
