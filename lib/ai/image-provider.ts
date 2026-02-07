/**
 * AI Image Provider Abstraction
 * 
 * This module provides a unified interface for AI image generation,
 * allowing easy switching between providers (OpenAI DALL-E, Stability AI, etc.)
 */

export interface GenerateImageOptions {
  prompt: string;
  size?: {
    width: number;
    height: number;
  };
  style?: string;
  model?: string;
  n?: number;
}

export interface GenerateImageResult {
  id: string;
  url: string;
  revisedPrompt?: string;
  metadata?: Record<string, unknown>;
}

export interface VariationOptions {
  imageUrl: string;
  promptDelta?: string;
  style?: string;
}

export interface ImageProvider {
  name: string;
  generate(options: GenerateImageOptions): Promise<GenerateImageResult>;
  createVariation?(options: VariationOptions): Promise<GenerateImageResult>;
}

// Mock Provider for development
export class MockImageProvider implements ImageProvider {
  name = 'mock';

  async generate(options: GenerateImageOptions): Promise<GenerateImageResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a placeholder image URL
    const { width = 1024, height = 1024 } = options.size || {};
    
    // Create a unique ID
    const id = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Use a placeholder service that generates images based on text
    // In production, this would be replaced with actual AI generation
    const seed = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;

    return {
      id,
      url,
      revisedPrompt: options.prompt,
      metadata: {
        provider: 'mock',
        model: 'placeholder',
        generatedAt: new Date().toISOString(),
        options,
      },
    };
  }

  async createVariation(options: VariationOptions): Promise<GenerateImageResult> {
    // Simulate variation generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const id = `mock_var_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const seed = Math.floor(Math.random() * 1000);
    const url = `https://picsum.photos/seed/${seed}/1024/1024`;

    return {
      id,
      url,
      revisedPrompt: options.promptDelta,
      metadata: {
        provider: 'mock',
        model: 'placeholder',
        isVariation: true,
        originalImage: options.imageUrl,
      },
    };
  }
}

// OpenAI DALL-E Provider (for production)
export class OpenAIImageProvider implements ImageProvider {
  name = 'openai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: GenerateImageOptions): Promise<GenerateImageResult> {
    const { width = 1024, height = 1024 } = options.size || {};
    
    // Map size to DALL-E supported sizes
    const size = this.mapSize(width, height);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'dall-e-3',
        prompt: this.enhancePrompt(options.prompt, options.style),
        n: options.n || 1,
        size,
        quality: 'hd',
        style: options.style === 'natural' ? 'natural' : 'vivid',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    const image = data.data[0];

    return {
      id: `openai_${Date.now()}`,
      url: image.url,
      revisedPrompt: image.revised_prompt,
      metadata: {
        provider: 'openai',
        model: options.model || 'dall-e-3',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private mapSize(width: number, height: number): string {
    // DALL-E 3 supports: 1024x1024, 1024x1792, 1792x1024
    if (width > height) return '1792x1024';
    if (height > width) return '1024x1792';
    return '1024x1024';
  }

  private enhancePrompt(prompt: string, style?: string): string {
    const styleGuide = style ? `, in a ${style} style` : '';
    return `Professional brand logo design: ${prompt}${styleGuide}. Clean, vector-style, suitable for branding.`;
  }
}

// Stability AI Provider (alternative)
export class StabilityAIProvider implements ImageProvider {
  name = 'stability';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: GenerateImageOptions): Promise<GenerateImageResult> {
    const { width = 1024, height = 1024 } = options.size || {};

    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: this.enhancePrompt(options.prompt, options.style),
              weight: 1,
            },
            {
              text: 'blurry, low quality, distorted text, ugly',
              weight: -1,
            },
          ],
          cfg_scale: 7,
          width: Math.min(width, 1024),
          height: Math.min(height, 1024),
          samples: options.n || 1,
          steps: 30,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }

    const data = await response.json();
    const image = data.artifacts[0];

    return {
      id: `stability_${Date.now()}`,
      url: `data:image/png;base64,${image.base64}`,
      metadata: {
        provider: 'stability',
        model: 'sdxl-1.0',
        generatedAt: new Date().toISOString(),
        seed: image.seed,
      },
    };
  }

  private enhancePrompt(prompt: string, style?: string): string {
    const styleGuide = style ? `, ${style} style` : '';
    return `Professional minimalist logo design, ${prompt}${styleGuide}, vector art, clean lines, brand identity, high quality`;
  }
}

// Provider factory
export function createImageProvider(provider?: string): ImageProvider {
  const providerName = provider || process.env.AI_IMAGE_PROVIDER || 'mock';

  switch (providerName) {
    case 'openai':
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        console.warn('OPENAI_API_KEY not set, falling back to mock provider');
        return new MockImageProvider();
      }
      return new OpenAIImageProvider(openaiKey);

    case 'stability':
      const stabilityKey = process.env.STABILITY_API_KEY;
      if (!stabilityKey) {
        console.warn('STABILITY_API_KEY not set, falling back to mock provider');
        return new MockImageProvider();
      }
      return new StabilityAIProvider(stabilityKey);

    case 'mock':
    default:
      return new MockImageProvider();
  }
}

// Prompt enhancement for Arabic/bilingual designs
export function enhancePromptForArabic(prompt: string, brandNameAr?: string): string {
  const arabicContext = brandNameAr
    ? `Include Arabic text "${brandNameAr}" with proper Arabic calligraphy styling.`
    : 'Design should complement Arabic typography aesthetics.';
  
  return `${prompt}. ${arabicContext} Ensure the design works well with RTL layouts and Arabic scripts. Use geometric patterns inspired by Islamic art if appropriate.`;
}

// Build prompt from project context
export function buildPromptFromProject(
  project: {
    brand_name: string;
    brand_name_ar?: string | null;
    industry?: string | null;
    keywords?: string[];
    style?: { mood?: string; complexity?: string };
    description?: string | null;
  },
  assetType: string,
  additionalPrompt?: string
): string {
  const parts: string[] = [];

  // Asset type specific prefix
  const typePrompts: Record<string, string> = {
    logo: 'Design a professional logo',
    icon: 'Create a simple, recognizable icon',
    pattern: 'Design a seamless repeating pattern',
    social_post: 'Create a social media post graphic',
    stationery: 'Design a stationery mockup',
    favicon: 'Create a simple favicon icon',
    wordmark: 'Design a typographic wordmark logo',
  };

  parts.push(typePrompts[assetType] || 'Design a brand asset');

  // Brand name
  parts.push(`for "${project.brand_name}"`);
  if (project.brand_name_ar) {
    parts.push(`(Arabic: "${project.brand_name_ar}")`);
  }

  // Industry
  if (project.industry) {
    parts.push(`in the ${project.industry} industry`);
  }

  // Style
  if (project.style?.mood) {
    parts.push(`with a ${project.style.mood} aesthetic`);
  }

  // Keywords
  if (project.keywords?.length) {
    parts.push(`incorporating themes of ${project.keywords.join(', ')}`);
  }

  // Description
  if (project.description) {
    parts.push(`. Brand context: ${project.description}`);
  }

  // Additional prompt
  if (additionalPrompt) {
    parts.push(`. Additional requirements: ${additionalPrompt}`);
  }

  return parts.join(' ');
}
