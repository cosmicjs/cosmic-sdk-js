---
"@cosmicjs/sdk": minor
---

Add `format` (`png` | `svg`) and `aspect_ratio` to `generateImage()`. SVG uploads are stored as `image/svg+xml`; use `media.url` (CDN) to display them, since imgix does not serve SVG.
