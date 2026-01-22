---
"flatfile": patch
---

Fix CLI deploy command namespace prompt in CI mode

The deploy command's namespace prompt was not respecting the --ci flag, causing CI pipelines to hang when no namespace was provided via options or environment variables. Now the prompt is skipped in CI mode.
