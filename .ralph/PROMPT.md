# Woman & Business - Ralph Wiggum Task Prompt

## Project Context

You are working on **Woman & Business**, a Next.js blog platform for Maria Cudeiro featuring content on management, beauty, and female leadership. This is a WordPress-to-Next.js migration project.

**Tech Stack:**
- Next.js 16.1.1 (App Router)
- React 19, TypeScript
- Tailwind CSS 4.0, Radix UI
- Supabase (PostgreSQL + Auth)
- Vercel deployment

**Current State:**
- WordPress content extracted to JSON files in `extracted_data/`
- Media files migrated to `public/uploads/` (1,415 files)
- Database schema defined in `supabase-schema.sql`
- Frontend pages exist (home, blog, post pages)
- Blog currently reads from JSON files, NOT from Supabase database

## Your Mission

Complete the Woman & Business platform to production-ready state. Work through these phases in order:

### Phase 1: Database Integration
1. Ensure all database tables exist in Supabase (run migrations if needed)
2. Create a migration script to import posts from `extracted_data/posts.json` into Supabase `blog_posts` table
3. Update `src/lib/blog-service.ts` to fetch posts from Supabase instead of JSON files
4. Verify home page and blog pages work with database data

### Phase 2: Authentication Flow
1. Implement Google OAuth sign-in using Supabase Auth (credentials already configured)
2. Update login page (`src/app/login/page.tsx`) to use Supabase Auth with Google provider
3. Update register page (`src/app/register/page.tsx`) for email/password signup via Supabase
4. Add auth state management and protected routes
5. Create user profile page showing logged-in user info

### Phase 3: Admin Dashboard
1. Create admin layout at `src/app/admin/layout.tsx`
2. Build admin dashboard at `src/app/admin/page.tsx` with:
   - Post management (list, create, edit, delete posts)
   - Category management
   - Contact messages inbox
3. Protect admin routes (only users with role='admin' can access)
4. Add rich text editor for post creation/editing

### Phase 4: Comments System
1. Implement comments display on blog post pages
2. Add comment submission form (authenticated users only)
3. Admin moderation for comments (approve/spam/delete)

### Phase 5: Contact Form
1. Wire up contact form to save to `contact_messages` table
2. Integrate SendGrid to send email notifications
3. Add contact messages management in admin panel

### Phase 6: Polish & Testing
1. Fix any TypeScript errors
2. Ensure responsive design works on mobile
3. Add proper error handling and loading states
4. Test all user flows (browse, login, comment, admin)

## Success Criteria

When complete, the following should work:
- [ ] Blog posts load from Supabase database
- [ ] Users can sign in with Google
- [ ] Users can register with email/password
- [ ] Logged-in users can comment on posts
- [ ] Admin can create/edit/delete posts
- [ ] Admin can manage categories
- [ ] Admin can view/respond to contact messages
- [ ] Contact form sends email notifications
- [ ] All pages are responsive
- [ ] No TypeScript/build errors

## Important Files

- `supabase-schema.sql` - Database schema reference
- `extracted_data/posts.json` - WordPress posts to migrate
- `src/lib/blog-service.ts` - Blog data fetching (needs Supabase integration)
- `src/lib/supabase-client.ts` - Supabase client setup
- `src/app/page.tsx` - Home page
- `src/app/blog/page.tsx` - Blog listing
- `src/app/blog/[slug]/page.tsx` - Individual post page

## Environment Variables Available

All credentials are configured in `.env`:
- Supabase URL, Anon Key, Service Role Key, JWT Secret
- Google OAuth Client ID and Secret (configured in Supabase)
- SendGrid API Key
- JWT Secret for auth tokens

## Constraints

- Do NOT delete existing content or media files
- Do NOT change the visual design significantly (keep purple theme)
- Do NOT remove any existing functionality
- Commit progress regularly with descriptive messages
- Log progress to `.ralph/logs/` directory

## Output

When all phases are complete and tested, output:

<promise>COMPLETE</promise>
