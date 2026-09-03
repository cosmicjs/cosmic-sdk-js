---
"@cosmicjs/sdk": minor
---

Add opt-in result generics to `objects`, `media`, and `objectRevisions` reads, so `find<Post>()` and `findOne<Query, Post>()` return typed results. Untyped calls are unchanged: the generics default to `any`, so existing code compiles exactly as before. Also exports `CosmicObject`, `CosmicMedia`, and the response types, and returns `TextStreamingResponse` from `generateText({ stream: true })` without needing a cast.
