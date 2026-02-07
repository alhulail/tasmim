'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Database } from '@/types/database';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetGridProps {
  assets: Asset[];
  locale: string;
  projectId: string;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
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

const ASSET_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  logo: { en: 'Logo', ar: 'شعار' },
  icon: { en: 'Icon', ar: 'أيقونة' },
  wordmark: { en: 'Wordmark', ar: 'علامة نصية' },
  pattern: { en: 'Pattern', ar: 'نمط' },
  favicon: { en: 'Favicon', ar: 'أيقونة موقع' },
  social_post: { en: 'Social Post', ar: 'منشور' },
  stationery: { en: 'Stationery', ar: 'قرطاسية' },
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-stone-100 text-stone-600',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
};

export function AssetGrid({ assets, locale, projectId }: AssetGridProps) {
  const isArabic = locale === 'ar';
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (asset: Asset, format: 'png' | 'svg' = 'png') => {
    if (!asset.image_url) return;
    
    setDownloadingId(asset.id);
    
    try {
      const response = await fetch(`/api/download?assetId=${asset.id}&format=${format}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.type}-${asset.id.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((asset) => (
        <Card 
          key={asset.id} 
          className="group border-stone-200 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden"
        >
          {/* Image Container */}
          <div className="relative aspect-square bg-stone-100">
            {asset.status === 'in_progress' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <LoadingSpinner className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm text-stone-500">
                    {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                  </p>
                </div>
              </div>
            ) : asset.image_url ? (
              <>
                <Image
                  src={asset.image_url}
                  alt={`${asset.type} asset`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Watermark overlay for watermarked assets */}
                {asset.is_watermarked && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-white/30 text-4xl font-bold rotate-[-30deg]">
                      TASMIM
                    </div>
                  </div>
                )}
                {/* Hover overlay with download button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white hover:bg-stone-100"
                    onClick={() => handleDownload(asset, 'png')}
                    disabled={downloadingId === asset.id}
                  >
                    {downloadingId === asset.id ? (
                      <LoadingSpinner className="h-4 w-4" />
                    ) : (
                      <>
                        <DownloadIcon className="h-4 w-4 me-1" />
                        PNG
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                {isArabic ? 'لا توجد صورة' : 'No image'}
              </div>
            )}
          </div>

          {/* Info Footer */}
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {ASSET_TYPE_LABELS[asset.type]?.[isArabic ? 'ar' : 'en'] || asset.type}
                </p>
                <p className="text-xs text-stone-400">
                  {formatDate(asset.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[asset.status] || STATUS_COLORS.todo}`}>
                  {asset.status === 'done' 
                    ? (isArabic ? 'مكتمل' : 'Done')
                    : asset.status === 'in_progress'
                    ? (isArabic ? 'قيد التنفيذ' : 'Processing')
                    : asset.status === 'failed'
                    ? (isArabic ? 'فشل' : 'Failed')
                    : (isArabic ? 'قيد الانتظار' : 'Pending')}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleDownload(asset, 'png')}
                      disabled={!asset.image_url || downloadingId === asset.id}
                    >
                      <DownloadIcon className="h-4 w-4 me-2" />
                      {isArabic ? 'تحميل PNG' : 'Download PNG'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(asset, 'svg')}
                      disabled={!asset.image_url || downloadingId === asset.id}
                    >
                      <DownloadIcon className="h-4 w-4 me-2" />
                      {isArabic ? 'تحميل SVG' : 'Download SVG'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
