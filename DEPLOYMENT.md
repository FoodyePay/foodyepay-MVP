# FoodyePay MVP - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. GitHub repository with the latest code
2. Vercel account
3. Environment variables ready

### Environment Variables Required:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_COINBASE_WALLET_PROJECT_ID=your_coinbase_project_id
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
RESEND_API_KEY=your_resend_api_key
```

### Quick Deploy Steps:

#### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FoodyePay/foodyepay-MVP)

#### Option 2: Manual Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `FoodyePay/foodyepay-MVP`
4. Add environment variables in Vercel dashboard
5. Deploy

### Features Deployed:
- ✅ Real Coinbase Smart Wallet integration
- ✅ Supabase user registration
- ✅ Email verification with Resend
- ✅ Auto-redirect after registration
- ✅ Dashboard for diners and restaurants
- ✅ Responsive design

### Post-Deploy Checklist:
1. Test wallet connection
2. Test user registration
3. Verify email sending
4. Check Supabase writes
5. Test auto-redirect functionality

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```

## 📱 Tech Stack
- Next.js 14 (App Router)
- OnchainKit (Coinbase Smart Wallet)
- Supabase (Database)
- Tailwind CSS
- TypeScript
- Resend (Email)
