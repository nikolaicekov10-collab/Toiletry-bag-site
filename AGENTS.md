# Working on Nikky’S Handmade

Before starting work, read [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
It records completed changes, verified checks, user decisions, and remaining work.
Treat it as project context; newer explicit user instructions take precedence.

- Communicate with the owner in Bulgarian.
- Use the existing checkout. Cloud sessions are already isolated; do not create a Git worktree unless requested.
- Check Git status and the current remote branch before changing or uploading work. Preserve existing user changes.
- Distinguish local changes, commits pushed to GitHub, and deployment to the live Sites website. A GitHub push does not prove a live deployment.
- Ask before publishing additional website changes unless the user has already authorized that exact upload or deployment. Do not request the same approval twice.
- Do not invent merchant registration details, addresses, product dimensions, care instructions, or product photographs. The owner has deferred supplying the missing details.
- Use the repository's supported scripts through `bash scripts/sites-env.sh -- ...`; tracked helpers lack executable bits.
- Do not send real orders or contact emails during testing. Intercept external submission or use the existing tests.
- Keep `docs/PROJECT_STATUS.md` current after meaningful work: record the final behavior, checks actually run, user decisions, GitHub/deployment status, and outstanding tasks. Never store credentials, tokens, or private customer data in these notes.

These files provide continuity through the repository, not access to earlier chats. If a later session has no checkout, select `nikolaicekov10-collab/Toiletry-bag-site` on `main` first.
