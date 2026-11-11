# Local Labour Observatory - persistent development starter

This package contains the existing Bergamo v0.9 prototype and a scheduled GitHub Actions development workflow that proposes **one small tested improvement each night**. It does not deploy or merge automatically.

## Setup

1. Create a **private** GitHub repository named e.g. `local-labour-observatory`.
2. Upload this folder's contents to the repository root (include `.github`).
3. In GitHub: Settings > Secrets and variables > Actions > New repository secret. Add `OPENAI_API_KEY` (never put the secret in a code file, message or commit).
4. Settings > Actions > General > Workflow permissions: choose Read and write permissions and allow GitHub Actions to create pull requests, if your organization permits. Keep branch protection and require review before merging.
5. Go to Actions > Nightly Observatory Agent > Run workflow to verify a first run. Nightly schedule is 02:15 UTC, i.e. 03:15 in Rome during winter, 04:15 in summer.
6. Open the generated PR, review changes and test in a browser before merging. Do not enable automatic merge.

## Local usage

- `npm test` performs structural regression tests (it does **not** substitute for browser tests).
- `npm run serve` serves `app/index.html` on http://localhost:8000 for manual testing.
- The prototype currently includes historical data and source claims carried from earlier versions; **the package does not independently certify them**.

## Operational cautions

- Scheduled GitHub Actions can be delayed or disabled in inactive repositories; they require a working GitHub account, Actions availability, and API budget.
- The Codex action runs a single improvement per invocation. Repeated improvement cycles require repeated scheduled runs.
- This is code automation, not a continuous always-on agent. It proposes PRs; it does not guarantee a finished product on any particular morning.
- The workflow intentionally avoids live data ingestion or external web calls. Official-data expansion is a separate, reviewed workflow.
- The latest PR branch is reused to avoid an unbounded queue of automated PRs. Review and merge regularly to keep proposals coherent.
- If no eligible change is found or tests fail, the run stops without opening a PR.