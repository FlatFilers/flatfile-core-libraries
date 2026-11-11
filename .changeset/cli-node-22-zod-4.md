---
"flatfile": major
---

Use `@flatfile/listener-driver-pubsub` 3, upgrade `zod` to ^4.6.6, and replace the deprecated `read-package-json` with a direct `package.json` read. Together these clear the remaining pubnub, zod and glob/minimatch advisories in fresh installs of the CLI.

**Breaking:** requires Node.js 22 or later.
