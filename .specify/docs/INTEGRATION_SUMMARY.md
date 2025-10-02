# Bolt MVP Integration Summary

## 📋 What's Been Prepared

### 1. Constitution Updated (v1.0.0 → v2.0.0)
**Location**: `.specify/memory/constitution.md`

**Major Changes**:
- ✅ Next.js 15.5+ (from 13.5 static export)
- ✅ React 19+ compatibility
- ✅ TypeScript 5.7+ (from 5.2.2)
- ✅ Tailwind CSS v4 (from v3.3.3)
- ✅ Clerk authentication (replacing Supabase Auth)
- ✅ Vercel deployment (replacing static export)
- ✅ Server Components architecture
- ✅ Bolt MVP migration standards

### 2. Migration Guide Created
**Location**: `.specify/docs/bolt-mvp-migration-guide.md`

**Covers**:
- Complete 7-phase migration plan
- Day-by-day timeline (6-7 days)
- Code examples for every step
- Supabase database setup
- Clerk authentication integration
- Vercel deployment configuration
- Testing checklist
- Rollback plan

### 3. Technical Decision Documentation
**Location**: `.specify/docs/clerk-vs-supabase-auth-decision.md`

**Explains**:
- Why Clerk for auth vs Supabase Auth
- Detailed comparison matrix
- Integration architecture
- Cost analysis
- Migration path from Supabase Auth

## 🎯 Recommended Approach

### Option A: Full Greenfield (Recommended)
**Best if**: Bolt MVP needs significant refactoring

1. Start fresh with modern stack:
   ```bash
   npx create-next-app@latest trespass-tracker --typescript --tailwind --app
   cd trespass-tracker
   npm install @clerk/nextjs @supabase/supabase-js
   npx shadcn@latest init
   ```

2. Copy feature logic from Bolt MVP
3. Follow constitution v2.0.0 from start
4. Use Server Components by default
5. Implement with Clerk + Supabase

**Timeline**: 5-7 days
**Risk**: Low (clean slate, modern patterns)

### Option B: Incremental Migration
**Best if**: Bolt MVP is mostly compatible, needs modernization

1. Create feature branch from current codebase
2. Follow migration guide phase by phase
3. Update dependencies incrementally
4. Replace auth with Clerk
5. Convert components to Server Components
6. Deploy to Vercel

**Timeline**: 7-10 days
**Risk**: Medium (dealing with legacy patterns)

### Option C: Hybrid Approach (Fastest)
**Best if**: Need quick MVP validation, then refine

1. Get Bolt MVP working as-is
2. Deploy to Vercel quickly
3. Add Clerk auth on top
4. Refactor to constitution standards iteratively

**Timeline**: 2-3 days initial, then ongoing
**Risk**: Higher (technical debt accumulates)

## 🚀 Quick Start (Option A - Recommended)

### Step 1: Initialize Project (30 min)
```bash
# Create Next.js 15 app
npx create-next-app@latest trespass-tracker \
  --typescript \
  --tailwind \
  --app \
  --import-alias "@/*"

cd trespass-tracker

# Install dependencies
npm install @clerk/nextjs @supabase/supabase-js date-fns zod
npm install -D @supabase/supabase-js

# Initialize shadcn/ui
npx shadcn@latest init
```

### Step 2: Setup Clerk (20 min)
1. Create account at https://clerk.com
2. Create application
3. Copy env variables to `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
4. Setup middleware (see migration guide)

### Step 3: Setup Supabase (30 min)
1. Create project at https://supabase.com
2. Copy connection details to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Create initial migration (copy from existing migrations)
4. Generate types: `npx supabase gen types typescript`

### Step 4: Deploy to Vercel (15 min)
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

**Total**: ~2 hours to full deployment

## 📁 Project Structure (Modern)

```
trespass-tracker/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx    # Clerk sign-in
│   │   └── sign-up/[[...sign-up]]/page.tsx    # Clerk sign-up
│   ├── dashboard/
│   │   ├── page.tsx                           # Server Component
│   │   └── _components/                       # Private components
│   │       ├── records-table.tsx              # Client Component
│   │       └── add-record-form.tsx            # Client Component
│   ├── actions/                               # Server Actions
│   │   ├── records.ts
│   │   └── users.ts
│   ├── api/                                   # API routes (if needed)
│   ├── layout.tsx                             # Root layout with Clerk
│   └── globals.css                            # Tailwind v4 imports
├── components/
│   └── ui/                                    # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Client-side Supabase
│   │   ├── server.ts                         # Server-side Supabase
│   │   └── types.ts                          # Generated types
│   └── utils.ts
├── supabase/
│   └── migrations/                            # Database migrations
├── middleware.ts                              # Clerk middleware
├── .env.local                                 # Local env vars (not committed)
└── next.config.mjs
```

## 🔧 Essential Commands

### Development
```bash
npm run dev              # Start dev server
npm run typecheck       # Check TypeScript (pre-commit)
npm run lint            # Run ESLint
npm run build           # Build for production
```

### Supabase
```bash
npx supabase init                              # Initialize Supabase
npx supabase migration new <name>              # Create migration
npx supabase db push                           # Push migrations
npx supabase gen types typescript              # Generate types
```

### Deployment
```bash
git push                # Vercel auto-deploys on push
vercel                  # Manual deployment
vercel --prod           # Deploy to production
```

## 📚 Key Documentation Files

| File | Purpose |
|------|---------|
| `.specify/memory/constitution.md` | Project principles & standards (v2.0.0) |
| `.specify/docs/bolt-mvp-migration-guide.md` | Step-by-step migration instructions |
| `.specify/docs/clerk-vs-supabase-auth-decision.md` | Auth architecture rationale |
| `CLAUDE.md` | AI assistant runtime guidance |

## ✅ Success Checklist

Before considering migration complete:

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] `npm run typecheck` passes with 0 errors
- [ ] No `any` types without JSDoc explanation
- [ ] Server Components used by default
- [ ] Client Components marked with 'use client'

### Authentication
- [ ] Clerk middleware protects routes
- [ ] Sign-in/sign-up flows work
- [ ] User button shows correct info
- [ ] Protected routes redirect properly
- [ ] JWT template configured for Supabase

### Database
- [ ] Supabase project created
- [ ] All migrations applied
- [ ] RLS policies enabled
- [ ] Types generated and imported
- [ ] Queries use Server Components/Actions

### Deployment
- [ ] Vercel project connected
- [ ] Environment variables configured
- [ ] Preview deployments work
- [ ] Production deployment successful
- [ ] Custom domain configured (if applicable)

### Testing
- [ ] All CRUD operations work
- [ ] Auth flows tested in production
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable (Core Web Vitals)
- [ ] No console errors

## 🆘 Common Issues & Solutions

### Issue: Hydration Errors
**Cause**: Server/client mismatch
**Solution**: Ensure 'use client' on interactive components, suppress hydration warnings for dates/times

### Issue: Clerk Auth Not Working
**Cause**: Wrong environment variables or middleware config
**Solution**: Check `.env.local`, verify middleware.ts matcher pattern

### Issue: Supabase RLS Blocking Queries
**Cause**: JWT not passed or RLS policy too restrictive
**Solution**: Verify getToken({ template: 'supabase' }) in server client

### Issue: Vercel Build Fails
**Cause**: TypeScript errors or missing env vars
**Solution**: Run `npm run build` locally first, check Vercel logs

## 📞 Support Resources

- **Next.js**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind v4**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vercel**: https://vercel.com/docs

## 🎯 Next Steps

1. **Choose approach** (A, B, or C above)
2. **Follow migration guide** for chosen approach
3. **Reference constitution** for standards
4. **Use /specify command** to create feature specs
5. **Deploy to Vercel** for testing
6. **Iterate and improve** based on feedback

---

**Ready to start?** Begin with the migration guide and follow the checklist!

**Questions?** Review the technical decision docs and constitution for guidance.

**Need help?** Use Claude Code with the `/specify`, `/plan`, and `/implement` commands.
