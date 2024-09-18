---
'@flatfile/react': patch
---

Fix bug causing "Maximum update depth exceeded" React error when multiple Portals are used within the same FlatfileProvider (this is not supported).
