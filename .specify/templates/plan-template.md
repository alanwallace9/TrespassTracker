
# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context
**Framework**: Next.js 15.5+ with App Router (Server Components + Server Actions)
**Language/Version**: TypeScript 5.7+ (strict mode)
**UI Stack**: Tailwind CSS v4 + shadcn/ui (React 19 compatible)
**Authentication**: Clerk (@clerk/nextjs v6+)
**Database**: Supabase (Postgres with RLS)
**Deployment**: Vercel (edge runtime where applicable)
**Testing**: [e.g., Vitest, Playwright, or NEEDS CLARIFICATION]
**Project Type**: web (Next.js App Router structure)
**Performance Goals**: [domain-specific, e.g., Core Web Vitals, <200ms TTFB or NEEDS CLARIFICATION]
**Constraints**: [domain-specific, e.g., mobile-first, offline support or NEEDS CLARIFICATION]
**Scale/Scope**: [domain-specific, e.g., 10k users, 50 routes, 100 DB tables or NEEDS CLARIFICATION]

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
*Based on Constitution v2.0.0 - Modern Stack (Next.js 15+, Clerk, Vercel)*

### Type Safety First (Principle I)
- [ ] TypeScript 5.7+ with strict mode enabled
- [ ] All components, Server Actions, and utilities have explicit types
- [ ] Database types auto-generated from Supabase schema (`supabase gen types`)
- [ ] No `any` types used without JSDoc justification
- [ ] Server Component props properly typed

### Modern Next.js Architecture (Principle II)
- [ ] Next.js 15.5+ with App Router used
- [ ] Server Components by default (not 'use client' everywhere)
- [ ] Server Actions used for data mutations (not API routes)
- [ ] Client Components only when necessary (interactivity, hooks, browser APIs)
- [ ] Optimized for Vercel deployment (edge runtime where beneficial)
- [ ] Image optimization via Next.js Image component

### Clerk Authentication (Principle III)
- [ ] Clerk (@clerk/nextjs v6+) installed and configured
- [ ] clerkMiddleware() protecting routes in middleware.ts
- [ ] Server Components use `await auth()` for auth checks
- [ ] Client Components use `useUser()` or `useAuth()` hooks
- [ ] No custom auth implementation (use Clerk's built-in components)
- [ ] JWT template configured for Supabase integration

### RLS Security (Principle IV)
- [ ] New database tables have RLS policies defined
- [ ] Migrations include RLS policy definitions
- [ ] RLS policies use Clerk user ID from JWT (`auth.jwt() ->> 'sub'`)
- [ ] Access patterns respect user role hierarchy
- [ ] Server Actions fetch auth before database queries

### Modern UI Stack (Principle V)
- [ ] Tailwind CSS v4+ with zero-config setup (@import "tailwindcss")
- [ ] shadcn/ui patterns followed for UI components
- [ ] Server Components default, 'use client' only when needed
- [ ] Path aliases (@/*) used consistently
- [ ] CSS-in-JS avoided (use Tailwind utilities)
- [ ] Theme variables in app/globals.css

### Deployment & Quality Gates (Principle VI)
- [ ] TypeScript compilation verified (npm run typecheck) - MUST PASS
- [ ] Production build successful (npm run build)
- [ ] Vercel preview deployment configured
- [ ] Environment variables documented for Vercel
- [ ] ESLint passes (recommended, not blocking)
- [ ] Clerk auth flows tested in development

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
**Next.js 15 App Router Structure** (Modern, Server Components First)

```
app/
├── (auth)/                      # Route group for auth pages
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
├── (dashboard)/                 # Route group for protected pages
│   ├── layout.tsx              # Dashboard layout (Server Component)
│   ├── page.tsx                # Dashboard home (Server Component)
│   └── [feature]/              # Feature-specific routes
│       ├── page.tsx            # Server Component
│       ├── loading.tsx         # Loading UI
│       ├── error.tsx           # Error boundary
│       └── _components/        # Private components (not routes)
│           ├── feature-table.tsx      # Client Component
│           └── feature-form.tsx       # Client Component
├── actions/                    # Server Actions (data mutations)
│   ├── records.ts
│   └── users.ts
├── api/                        # API routes (only if absolutely needed)
│   └── webhooks/
├── layout.tsx                  # Root layout with ClerkProvider
├── globals.css                 # Tailwind v4 (@import "tailwindcss")
└── error.tsx                   # Global error boundary

components/
├── ui/                         # shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
└── [shared]/                   # Shared feature components
    ├── header.tsx              # Can be Server Component
    └── footer.tsx              # Can be Server Component

lib/
├── supabase/
│   ├── client.ts               # Client-side Supabase
│   ├── server.ts               # Server-side Supabase with Clerk JWT
│   └── types.ts                # Auto-generated types
└── utils.ts                    # Utilities (cn, formatters, etc.)

supabase/
└── migrations/                 # Database migrations
    └── YYYYMMDDHHMMSS_*.sql

middleware.ts                   # Clerk middleware (route protection)
next.config.mjs                 # Next.js configuration
```

**Key Patterns**:
- **Server Components by Default**: All components in `app/` unless 'use client'
- **Server Actions**: Mutations in `app/actions/` directory
- **Route Groups**: Use `(group)` for layout organization without affecting URLs
- **Private Components**: `_components/` prefix prevents routing
- **Colocation**: Keep related code close (actions, components, routes)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Design Server Actions** from functional requirements:
   - For each user mutation → Server Action in `app/actions/`
   - Define TypeScript types for inputs/outputs
   - Document in `/contracts/` as TypeScript interfaces
   - Use Zod schemas for validation

3. **Generate Server Action tests** from contracts:
   - One test file per action
   - Assert input validation and output types
   - Mock Clerk auth and Supabase calls
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/* (TypeScript interfaces), failing tests, quickstart.md, CLAUDE.md updates

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.0.0 - See `.specify/memory/constitution.md`*
