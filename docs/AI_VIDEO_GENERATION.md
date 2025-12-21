# AI Video Generation with Cosmic SDK

Generate AI-powered videos using Google's Veo 3.1 models directly from your JavaScript/TypeScript applications.

## Installation

```bash
npm install @cosmicjs/sdk
```

## Quick Start

```typescript
import { createBucketClient } from '@cosmicjs/sdk'

const cosmic = createBucketClient({
  bucketSlug: 'YOUR_BUCKET_SLUG',
  readKey: 'YOUR_READ_KEY',
  writeKey: 'YOUR_WRITE_KEY'
})

// Generate a video
const video = await cosmic.ai.generateVideo({
  prompt: 'A calico kitten playing with a ball of yarn in golden sunlight',
  duration: 8,
  resolution: '720p'
})

console.log(video.media.url) // Direct CDN URL to the video
```

## API Reference

### `generateVideo(options)`

Generate AI videos using Google's Veo 3.1 models.

#### Parameters

```typescript
interface GenerateVideoOptions {
  prompt: string;                                             // Required
  model?: 'veo-3.1-fast-generate-preview'                   // Optional (default: fast)
        | 'veo-3.1-generate-preview';
  duration?: 4 | 6 | 8;                                      // Optional (default: 8)
  resolution?: '720p' | '1080p';                             // Optional (default: '720p')
  reference_images?: string[];                                // Optional (max 3 URLs)
  metadata?: Record<string, any>;                            // Optional
  folder?: string;                                           // Optional
}
```

#### Response

```typescript
interface VideoGenerationResponse {
  media: {
    id: string;
    name: string;
    url: string;                    // Direct CDN URL
    imgix_url: string;
    type: string;                   // 'video/mp4'
    size: number;                   // File size in bytes
    bucket: string;
    created_at: string;
    metadata?: {
      duration: number;             // Video duration in seconds
      resolution: string;           // '720p' or '1080p'
      generation_time_seconds: number;
      prompt?: string;              // Original prompt
      model?: string;               // Model used
      [key: string]: any;           // Custom metadata
    };
    folder?: string | null;
    alt_text?: string;
  };
  usage: {
    input_tokens: number;           // Prompt tokens (typically 0)
    output_tokens: number;          // Video generation cost (144K-768K)
    total_tokens: number;
  };
  generation_time_seconds: number;  // Total generation time
}
```

## Examples

### Basic Video Generation

```typescript
const video = await cosmic.ai.generateVideo({
  prompt: 'A serene mountain landscape at sunset with gentle wind rustling through trees',
  duration: 6,
  resolution: '720p'
})

console.log(`Video URL: ${video.media.url}`)
console.log(`Duration: ${video.media.metadata.duration}s`)
console.log(`Tokens used: ${video.usage.total_tokens}`)
```

### Premium Quality Video

```typescript
const premiumVideo = await cosmic.ai.generateVideo({
  prompt: 'Cinematic close-up of raindrops falling on a window at night, city lights blurred in the background',
  model: 'veo-3.1-generate-preview',  // Premium quality
  duration: 8,
  resolution: '1080p',
  folder: 'premium-videos'
})
```

### Video with Reference Images

Use reference images to guide the video generation with visual context (image-to-video mode).

```typescript
const productVideo = await cosmic.ai.generateVideo({
  prompt: 'Product rotates smoothly revealing all angles with soft studio lighting',
  duration: 8,
  resolution: '720p',
  reference_images: [
    'https://cdn.cosmicjs.com/product-hero.jpg'
  ],
  metadata: {
    product_id: 'prod_123',
    campaign: 'product-launch-2024'
  },
  folder: 'ai-videos'
})

console.log(`Generated video: ${productVideo.media.url}`)
```

### Multiple Reference Images

Provide up to 3 reference images for style, content, or character consistency.

```typescript
const styledVideo = await cosmic.ai.generateVideo({
  prompt: 'Character walks through a vibrant marketplace with people and colors matching the reference style',
  duration: 8,
  reference_images: [
    'https://cdn.cosmicjs.com/character-ref-1.jpg',
    'https://cdn.cosmicjs.com/style-ref.jpg',
    'https://cdn.cosmicjs.com/color-palette.jpg'
  ]
})
```

### With Custom Metadata

```typescript
const video = await cosmic.ai.generateVideo({
  prompt: 'Time-lapse of a flower blooming with butterflies around',
  duration: 8,
  metadata: {
    project: 'nature-series',
    episode: 3,
    scene: 'flower-bloom',
    tags: ['nature', 'time-lapse', 'flowers']
  }
})
```

### Error Handling

```typescript
try {
  const video = await cosmic.ai.generateVideo({
    prompt: 'A beautiful sunset over the ocean',
    duration: 8
  })
  
  console.log('Video generated successfully:', video.media.url)
} catch (error) {
  if (error.message.includes('token')) {
    console.error('Insufficient tokens:', error.message)
  } else if (error.message.includes('prompt')) {
    console.error('Invalid prompt:', error.message)
  } else {
    console.error('Generation failed:', error.message)
  }
}
```

## Model Options

### Veo 3.1 Fast (Recommended)

```typescript
model: 'veo-3.1-fast-generate-preview'  // Default
```

- **Generation Time**: 30-90 seconds
- **Token Cost**: 144,000-288,000 output tokens
- **Best For**: Most use cases, quick turnaround

### Veo 3.1 Standard (Premium Quality)

```typescript
model: 'veo-3.1-generate-preview'
```

- **Generation Time**: 60-180 seconds
- **Token Cost**: 384,000-768,000 output tokens
- **Best For**: Premium cinematic quality, hero content

## Token Costs

Video generation costs are billed as **output tokens**:

### Veo 3.1 Fast

| Duration | Output Tokens | Approx. Cost |
|----------|---------------|--------------|
| 4 seconds | 144,000 | $0.60 |
| 6 seconds | 216,000 | $0.90 |
| 8 seconds | 288,000 | $1.20 |

### Veo 3.1 Standard

| Duration | Output Tokens | Approx. Cost |
|----------|---------------|--------------|
| 4 seconds | 384,000 | $1.60 |
| 6 seconds | 576,000 | $2.40 |
| 8 seconds | 768,000 | $3.20 |

**Note**: Video generation is significantly more expensive than image generation. A single 8-second video costs the same as approximately 60 DALL-E 3 images.

## Technical Specifications

- **Format**: MP4 with H.264 encoding
- **Durations**: 4, 6, or 8 seconds
- **Resolutions**: 720p (1280×720) or 1080p (1920×1080)
- **Audio**: Native stereo audio generation included
- **File Size**: Typically 5-15MB depending on duration and resolution
- **Generation Time**: 30-90s (Fast), 60-180s (Standard)
- **Reference Images**: Up to 3 images (image-to-video mode)

## Tips for Best Results

### Writing Effective Prompts

1. **Be specific about motion**: "Camera slowly zooms in" vs "camera moves"
2. **Describe lighting**: "soft studio lighting", "golden hour sunlight"
3. **Include atmosphere**: "vibrant colors", "dramatic depth of field"
4. **Specify camera angles**: "close-up", "wide shot", "aerial view"

### Using Reference Images

1. **Image-to-Video Mode**: The first reference image becomes the starting frame
2. **Style Consistency**: Provide 2-3 images showing the desired visual style
3. **Character Consistency**: Multiple angles help maintain character appearance
4. **Product Videos**: Show your product from key angles for accurate representation

### Optimization

1. **Use Fast model for iteration**: Quickly test prompts with the fast model
2. **Switch to Standard for finals**: Use premium quality for final deliverables
3. **Start with 4s duration**: Shorter videos generate faster and cost less
4. **Batch similar videos**: Generate multiple variations in one session

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { 
  createBucketClient,
  GenerateVideoOptions,
  VideoGenerationResponse 
} from '@cosmicjs/sdk'

// Type-safe options
const options: GenerateVideoOptions = {
  prompt: 'A peaceful zen garden with raking sand patterns',
  model: 'veo-3.1-fast-generate-preview',
  duration: 8,
  resolution: '720p'
}

// Type-safe response
const response: VideoGenerationResponse = await cosmic.ai.generateVideo(options)
```

## Related Documentation

- [AI Image Generation](https://www.cosmicjs.com/docs/api/ai#generate-image)
- [AI Text Generation](https://www.cosmicjs.com/docs/api/ai#generate-text)
- [Token Usage & Pricing](https://www.cosmicjs.com/pricing)
- [Media Management](https://www.cosmicjs.com/docs/api/media)

## Support

For questions or issues:
- [Documentation](https://www.cosmicjs.com/docs)
- [GitHub Issues](https://github.com/cosmicjs/cosmic-sdk-js/issues)
- [Community Slack](https://cosmicjs.com/community)

