# Instructions for the Local Labour Observatory agent

This is a real-data analytical product for Italian local labour markets. Work in Italian and optimize usability, auditability, visual quality and data integrity.

**Non-negotiable**
- Never fabricate numbers, citations, data availability, or methodological claims.
- Never silently change any sourced observation or historical value.
- Never alter existing source attribution, year, population scope, or territorial scope except to correct a documented error.
- Do not connect to external websites, APIs or run network commands; this job is a code improvement run using only the checked-in repository.
- Do not change `.github/`, `tests/`, `package.json`, `AGENTS.md`, `TASKS.md`, or data files. Change `app/index.html` only.
- Preserve full functionality and compatibility with the native iOS file preview when practical. Anchor navigation must work without JavaScript.
- Keep the app self-contained: no CDN JS/CSS, no analytics, no credentials, no externally loaded fonts.
- Improve one small, high-value defect or enhancement per run, not a wholesale redesign. Avoid changing untouched content.
- Check `TASKS.md` for product priorities. Infer what remains incomplete from code, not from inventing feature completion.
- Run `npm test` before finishing. If tests fail, fix the defect or leave files unchanged.
- Never declare a visual/browser test passed unless actually run.
- Data imported by the user must always be labeled as unverified.

For each cycle: inspect -> choose one improvement -> implement -> test -> briefly explain what changed, limitations, and next priority. A pull request is opened for review, never automatically merged into the release branch.