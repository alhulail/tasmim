// Database types for Tasmim

export type PlanType = 'free' | 'starter' | 'pro' | 'one_time';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type AssetType = 'logo' | 'icon' | 'pattern' | 'social_post' | 'stationery' | 'favicon' | 'wordmark';
export type AssetStatus = 'todo' | 'in_progress' | 'done' | 'failed';
export type LocaleType = 'en' | 'ar';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  locale: LocaleType;
  plan: PlanType;
  credits_balance: number;
  trial_generations_used: number;
  trial_generations_limit: number;
  credits_reset_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  brand_name: string;
  brand_name_ar: string | null;
  industry: string | null;
  keywords: string[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
  style: {
    mood: string;
    complexity: string;
    [key: string]: string;
  };
  target_audience: string | null;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  user_id: string;
  type: AssetType;
  status: AssetStatus;
  prompt: string | null;
  model: string | null;
  image_url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    original_prompt?: string;
    [key: string]: unknown;
  };
  is_watermarked: boolean;
  is_favorite: boolean;
  version: number;
  parent_asset_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  project_id: string | null;
  asset_id: string | null;
  request: {
    prompt: string;
    style?: string;
    size?: string;
    [key: string]: unknown;
  };
  response: {
    image_url?: string;
    error?: string;
    [key: string]: unknown;
  } | null;
  provider: string;
  model: string | null;
  credits_used: number;
  is_trial: boolean;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanType;
  status: SubscriptionStatus;
  provider: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignerConsult {
  id: string;
  user_id: string;
  month_key: string;
  used: boolean;
  iterations_used: number;
  iterations_limit: number;
  notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile> & { id: string; email: string };
        Update: Partial<UserProfile>;
      };
      projects: {
        Row: Project;
        Insert: {
          user_id: string;
          brand_name: string;
          brand_name_ar?: string | null;
          industry?: string | null;
          keywords?: string[];
          palette?: Record<string, string>;
          style?: Record<string, string>;
          target_audience?: string | null;
          description?: string | null;
          is_archived?: boolean;
        };
        Update: Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>;
      };
      assets: {
        Row: Asset;
        Insert: {
          project_id: string;
          user_id: string;
          type: AssetType;
          status?: AssetStatus;
          prompt?: string | null;
          model?: string | null;
          image_url?: string | null;
          storage_path?: string | null;
          thumbnail_url?: string | null;
          metadata?: Record<string, unknown>;
          is_watermarked?: boolean;
          is_favorite?: boolean;
          version?: number;
          parent_asset_id?: string | null;
        };
        Update: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>;
      };
      generations: {
        Row: Generation;
        Insert: {
          user_id: string;
          project_id?: string | null;
          asset_id?: string | null;
          request: Record<string, unknown>;
          response?: Record<string, unknown> | null;
          provider?: string;
          model?: string | null;
          credits_used?: number;
          is_trial?: boolean;
          processing_time_ms?: number | null;
          error_message?: string | null;
        };
        Update: Partial<Omit<Generation, 'id' | 'user_id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string; plan: PlanType };
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>;
      };
      designer_consults: {
        Row: DesignerConsult;
        Insert: Partial<DesignerConsult> & { user_id: string; month_key: string };
        Update: Partial<Omit<DesignerConsult, 'id' | 'user_id' | 'created_at'>>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: {
          user_id: string;
          amount: number;
          balance_after: number;
          reason: string;
          reference_id?: string | null;
        };
        Update: never; // Read-only audit table
      };
    };
    Functions: {
      use_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_reference_id?: string;
        };
        Returns: {
          success: boolean;
          new_balance: number;
          error_message: string | null;
        }[];
      };
      add_credits: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_reference_id?: string;
        };
        Returns: number;
      };
    };
  };
}

// Plan definitions
export const PLANS = {
  free: {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    credits: 0,
    trialGenerations: 2,
    features: ['2 trial logo generations', 'Watermarked downloads', 'Basic editor'],
    featuresAr: ['2 تجربة إنشاء شعار', 'تحميلات بعلامة مائية', 'محرر أساسي'],
  },
  starter: {
    name: 'Starter',
    nameAr: 'البداية',
    price: 19,
    credits: 15,
    features: [
      '15 credits/month',
      'Logo & icon generation',
      'No watermarks',
      'SVG exports',
      'Basic editor',
    ],
    featuresAr: [
      '15 رصيد/شهر',
      'إنشاء شعار وأيقونة',
      'بدون علامة مائية',
      'تصدير SVG',
      'محرر أساسي',
    ],
  },
  pro: {
    name: 'Pro',
    nameAr: 'احترافي',
    price: 49,
    credits: 50,
    features: [
      '50 credits/month',
      'All asset types',
      'Source file exports',
      'Advanced editor',
      '1 designer consultation/month',
      'Priority support',
    ],
    featuresAr: [
      '50 رصيد/شهر',
      'جميع أنواع الأصول',
      'تصدير ملفات المصدر',
      'محرر متقدم',
      '1 استشارة مصمم/شهر',
      'دعم أولوي',
    ],
  },
  one_time: {
    name: 'Brand Package',
    nameAr: 'حزمة العلامة التجارية',
    price: 149,
    credits: 0,
    features: [
      '1 complete logo',
      'Stationery placements',
      '2 packages of choice',
      '2 social posts',
      'All source files',
      'Unlimited revisions',
    ],
    featuresAr: [
      'شعار كامل واحد',
      'تطبيقات القرطاسية',
      '2 حزم من اختيارك',
      '2 منشور اجتماعي',
      'جميع ملفات المصدر',
      'تعديلات غير محدودة',
    ],
  },
} as const;

// Asset type labels
export const ASSET_TYPES = {
  logo: { name: 'Logo', nameAr: 'شعار', icon: 'Shapes' },
  icon: { name: 'Icon', nameAr: 'أيقونة', icon: 'Circle' },
  pattern: { name: 'Pattern', nameAr: 'نمط', icon: 'Grid3X3' },
  social_post: { name: 'Social Post', nameAr: 'منشور اجتماعي', icon: 'Share2' },
  stationery: { name: 'Stationery', nameAr: 'قرطاسية', icon: 'FileText' },
  favicon: { name: 'Favicon', nameAr: 'أيقونة الموقع', icon: 'Globe' },
  wordmark: { name: 'Wordmark', nameAr: 'علامة نصية', icon: 'Type' },
} as const;

// Status labels
export const ASSET_STATUSES = {
  todo: { name: 'To Do', nameAr: 'للتنفيذ', color: 'status-todo' },
  in_progress: { name: 'In Progress', nameAr: 'جاري التنفيذ', color: 'status-in-progress' },
  done: { name: 'Done', nameAr: 'مكتمل', color: 'status-done' },
  failed: { name: 'Failed', nameAr: 'فشل', color: 'status-failed' },
} as const;

// Industry options
export const INDUSTRIES = [
  { value: 'technology', name: 'Technology', nameAr: 'تكنولوجيا' },
  { value: 'food', name: 'Food & Beverage', nameAr: 'طعام ومشروبات' },
  { value: 'fashion', name: 'Fashion', nameAr: 'أزياء' },
  { value: 'health', name: 'Health & Wellness', nameAr: 'صحة وعافية' },
  { value: 'finance', name: 'Finance', nameAr: 'مالية' },
  { value: 'education', name: 'Education', nameAr: 'تعليم' },
  { value: 'real_estate', name: 'Real Estate', nameAr: 'عقارات' },
  { value: 'entertainment', name: 'Entertainment', nameAr: 'ترفيه' },
  { value: 'retail', name: 'Retail', nameAr: 'تجارة' },
  { value: 'hospitality', name: 'Hospitality', nameAr: 'ضيافة' },
  { value: 'automotive', name: 'Automotive', nameAr: 'سيارات' },
  { value: 'creative', name: 'Creative Agency', nameAr: 'وكالة إبداعية' },
  { value: 'nonprofit', name: 'Non-profit', nameAr: 'غير ربحية' },
  { value: 'other', name: 'Other', nameAr: 'أخرى' },
] as const;

// Style moods
export const STYLE_MOODS = [
  { value: 'modern', name: 'Modern', nameAr: 'عصري' },
  { value: 'classic', name: 'Classic', nameAr: 'كلاسيكي' },
  { value: 'playful', name: 'Playful', nameAr: 'مرح' },
  { value: 'elegant', name: 'Elegant', nameAr: 'أنيق' },
  { value: 'bold', name: 'Bold', nameAr: 'جريء' },
  { value: 'minimal', name: 'Minimal', nameAr: 'بسيط' },
  { value: 'luxury', name: 'Luxury', nameAr: 'فاخر' },
  { value: 'geometric', name: 'Geometric', nameAr: 'هندسي' },
  { value: 'organic', name: 'Organic', nameAr: 'طبيعي' },
  { value: 'tech', name: 'Tech', nameAr: 'تقني' },
] as const;
