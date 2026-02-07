# Tasmim.ai | تصميم

AI-powered logo and brand asset generation platform, optimized for Arabic typography and bilingual MENA brand identities.

## 🚀 Features

- **AI-Powered Generation**: Generate professional logos and brand assets using AI
- **Arabic Typography Excellence**: Curated Arabic fonts with proper shaping and RTL support
- **Bilingual Identities**: Create harmonious Arabic-English brand lockups
- **Full Editor**: Customize colors, fonts, and layouts
- **Multiple Export Formats**: PNG, SVG, and source files
- **Credit System**: Free trials + paid plans with monthly credits

## 📋 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **i18n**: next-intl with Arabic/English support
- **Image Processing**: Sharp for watermarking
- **AI Integration**: Pluggable providers (OpenAI DALL-E, Stability AI, Mock)

## 🏗️ Project Structure

```
tasmim/
├── app/
│   ├── [locale]/              # Locale-specific routes
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── layout.tsx         # Locale layout with i18n
│   │   └── page.tsx           # Landing page
│   ├── api/
│   │   ├── generate/          # AI generation endpoint
│   │   └── download/          # Download with watermarking
│   ├── auth/
│   │   └── callback/          # OAuth callback
│   ├── globals.css
│   └── layout.tsx             # Root layout
├── components/
│   ├── dashboard/             # Dashboard components
│   ├── ui/                    # shadcn/ui components
│   └── language-switcher.tsx
├── i18n/
│   ├── messages/
│   │   ├── ar.json            # Arabic translations
│   │   └── en.json            # English translations
│   └── request.ts             # i18n config
├── lib/
│   ├── ai/
│   │   └── image-provider.ts  # AI provider abstraction
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   └── server.ts          # Server client
│   ├── utils.ts               # Utility functions
│   └── validations.ts         # Zod schemas
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── types/
│   └── database.ts            # TypeScript types
└── middleware.ts              # Auth + locale middleware
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- (Optional) OpenAI API key for AI generation

### 1. Clone and Install

```bash
git clone <repository>
cd tasmim
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (optional - defaults to mock)
AI_IMAGE_PROVIDER=mock  # or 'openai', 'stability'
OPENAI_API_KEY=sk-your-key  # if using openai
```

### 3. Database Setup

Run the migration in your Supabase project:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
```

### 4. Configure Supabase Auth

In your Supabase dashboard:

1. Enable Google OAuth provider
2. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

### 5. Create Storage Buckets

In Supabase Storage, create:

- `assets-public` (public bucket for previews)
- `assets-private` (private bucket for paid downloads)

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `user_profiles` | User data, credits, plan info |
| `projects` | Brand projects with settings |
| `assets` | Generated assets (logos, icons, etc.) |
| `generations` | AI generation audit log |
| `subscriptions` | Payment subscriptions |
| `designer_consults` | Pro plan consultations |
| `credit_transactions` | Credit usage history |

### Key Functions

- `use_credits(user_id, amount, reason)` - Atomic credit deduction
- `add_credits(user_id, amount, reason)` - Add credits (subscription renewal)
- `handle_new_user()` - Auto-create profile on signup

## 💳 Plans & Pricing

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free | $0 | 2 trials | Watermarked downloads |
| Starter | $19/mo | 15/mo | PNG, SVG exports |
| Pro | $49/mo | 50/mo | Source files, designer consult |
| One-time | $149 | N/A | Complete brand package |

## 🌐 i18n Support

The app supports:
- **English** (LTR) - default
- **Arabic** (RTL) - full translation

URLs are prefixed with locale: `/en/dashboard`, `/ar/dashboard`

## 🔒 Security

- Server-side validation with Zod
- Row Level Security (RLS) on all tables
- Atomic credit operations
- Rate limiting on generation endpoints
- Signed URLs for private downloads
- Server-side watermarking

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Environment Variables

Set in your deployment platform:
- All variables from `.env.local`
- `NEXT_PUBLIC_APP_URL` - your production URL

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

---

Built with ❤️ for MENA brands
