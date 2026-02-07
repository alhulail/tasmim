import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Project schemas
export const createProjectSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required').max(100),
  brand_name_ar: z.string().max(100).optional(),
  industry: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  palette: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  }).default({
    primary: '#1a365d',
    secondary: '#c6a962',
    accent: '#e2e8f0',
  }),
  style: z.object({
    mood: z.string(),
    complexity: z.enum(['simple', 'moderate', 'detailed']),
  }).default({
    mood: 'modern',
    complexity: 'simple',
  }),
  target_audience: z.string().max(500).optional(),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// Generation schemas
export const generateAssetSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  type: z.enum(['logo', 'icon', 'pattern', 'social_post', 'stationery', 'favicon', 'wordmark']),
  prompt: z.string().min(1, 'Prompt is required').max(1000),
  style: z.string().optional(),
  language: z.enum(['en', 'ar', 'bilingual']).default('bilingual'),
  size: z.object({
    width: z.number().min(256).max(2048),
    height: z.number().min(256).max(2048),
  }).default({ width: 1024, height: 1024 }),
  model: z.string().optional(),
});

export const generateVariationSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  prompt_delta: z.string().max(500).optional(),
  style_changes: z.record(z.string()).optional(),
});

// Profile schemas
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().optional(),
  locale: z.enum(['en', 'ar']).optional(),
});

// Download schema
export const downloadAssetSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  format: z.enum(['png', 'svg', 'source']),
  watermarked: z.boolean().default(false),
});

// Subscription schema
export const createSubscriptionSchema = z.object({
  plan: z.enum(['starter', 'pro', 'one_time']),
  payment_method_id: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GenerateAssetInput = z.infer<typeof generateAssetSchema>;
export type GenerateVariationInput = z.infer<typeof generateVariationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DownloadAssetInput = z.infer<typeof downloadAssetSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
