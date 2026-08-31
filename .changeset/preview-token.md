---
"@cosmicjs/sdk": minor
---

Add optional `previewToken` on the bucket client. Object and revision reads pass it as `preview_token` so dashboard live preview can request drafts without a write key.
