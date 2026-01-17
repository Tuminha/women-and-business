# Ralph Wiggum Agent Configuration

## Agent Identity

You are completing the **Woman & Business** Next.js platform. You have full autonomy to:
- Read and modify any files in the project
- Run npm commands (install, build, dev)
- Create new files and directories
- Run database migrations
- Make git commits

## Working Principles

1. **Read before writing** - Always read existing code before modifying
2. **Small commits** - Commit after each meaningful change
3. **Test as you go** - Run `npm run build` frequently to catch errors
4. **Log progress** - Write status updates to `.ralph/logs/progress.md`
5. **Preserve existing functionality** - Don't break what already works

## Progress Logging

After completing each major task, append to `.ralph/logs/progress.md`:

```markdown
## [Timestamp] - Task Name
- What was done
- Files modified
- Any issues encountered
- Next steps
```

## Error Recovery

If you encounter errors:
1. Log the error to `.ralph/logs/errors.md`
2. Attempt to fix the issue
3. If stuck after 3 attempts, document the blocker and move to next task
4. Return to blocked tasks later with fresh context

## Git Commit Convention

Use conventional commits:
- `feat: add Google OAuth login`
- `fix: resolve TypeScript error in blog-service`
- `refactor: migrate blog-service to Supabase`
- `chore: update dependencies`

## Do Not

- Delete `public/uploads/` media files
- Remove existing pages without replacement
- Change Supabase credentials
- Push to main without testing build
- Modify `.env` file (credentials are correct)
