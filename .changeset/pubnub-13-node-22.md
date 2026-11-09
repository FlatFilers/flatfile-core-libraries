---
"@flatfile/listener-driver-pubsub": major
---

Upgrade `pubnub` from 8.2.4 to ^13.1.3. This removes the `react-native` and `proxy-agent` dependency chains (and the `basic-ftp`, `shell-quote` and related advisories they carried) from server-side installs.

**Breaking:** requires Node.js 22 or later, matching `pubnub` 12+.
