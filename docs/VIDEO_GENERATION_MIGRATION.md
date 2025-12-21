# Video Generation Migration Guide

## Upgrading to Video Generation Support

This guide helps you add video generation capabilities to your existing Cosmic SDK integration.

## Quick Start

### 1. Update the SDK

```bash
npm install @cosmicjs/sdk@latest
# or
yarn add @cosmicjs/sdk@latest
# or
bun add @cosmicjs/sdk@latest
```

### 2. Verify Installation

Check your `package.json`:

```json
{
  "dependencies": {
    "@cosmicjs/sdk": "^1.5.6" // or later
  }
}
```

### 3. Start Using Video Generation

```typescript
import { createBucketClient } from '@cosmicjs/sdk';

const cosmic = createBucketClient({
  bucketSlug: 'YOUR_BUCKET_SLUG',
  readKey: 'YOUR_READ_KEY',
  writeKey: 'YOUR_WRITE_KEY'
});

// Generate your first video!
const video = await cosmic.ai.generateVideo({
  prompt: 'A serene mountain landscape at sunset',
  duration: 8,
  resolution: '720p'
});

console.log(video.media.url); // Your video is ready!
```

## For Existing AI Users

If you're already using `generateText()` or `generateImage()`, adding video generation is seamless:

### Before (Images Only)

```typescript
// Your existing image generation code
const image = await cosmic.ai.generateImage({
  prompt: 'A beautiful sunset',
  folder: 'ai-generated'
});
```

### After (Images + Videos)

```typescript
// Keep your existing image generation
const image = await cosmic.ai.generateImage({
  prompt: 'A beautiful sunset',
  folder: 'ai-generated'
});

// Add video generation
const video = await cosmic.ai.generateVideo({
  prompt: 'A beautiful sunset with moving clouds',
  duration: 8,
  folder: 'ai-generated'
});
```

## TypeScript Users

### Import New Types

```typescript
import { 
  createBucketClient,
  // Add these new types:
  GenerateVideoOptions,
  VideoGenerationResponse 
} from '@cosmicjs/sdk';
```

### Type-Safe Usage

```typescript
const options: GenerateVideoOptions = {
  prompt: 'Your video description',
  model: 'veo-3.1-fast-generate-preview',
  duration: 8,
  resolution: '720p',
  reference_images: ['https://example.com/image.jpg'],
  metadata: { custom: 'data' },
  folder: 'videos'
};

const result: VideoGenerationResponse = await cosmic.ai.generateVideo(options);
```

## Common Use Cases

### Use Case 1: Product Showcase Videos

Replace static product images with dynamic videos:

```typescript
// Before: Static image
const productImage = await cosmic.ai.generateImage({
  prompt: 'Premium coffee mug on white background',
  folder: 'products'
});

// After: Dynamic video with your product image
const productVideo = await cosmic.ai.generateVideo({
  prompt: 'Product rotates smoothly revealing all angles with soft studio lighting',
  duration: 8,
  reference_images: [productImage.media.url], // Use the generated image!
  folder: 'products'
});
```

### Use Case 2: Social Media Content

Generate video content for social platforms:

```typescript
// Instagram Reel
const reelVideo = await cosmic.ai.generateVideo({
  prompt: 'Time-lapse of sunrise over city skyline with vibrant colors',
  duration: 6,
  resolution: '1080p',
  metadata: {
    platform: 'instagram',
    content_type: 'reel'
  },
  folder: 'social-media'
});
```

### Use Case 3: Marketing Campaigns

Create hero videos for campaigns:

```typescript
// Hero video with reference image
const campaignVideo = await cosmic.ai.generateVideo({
  prompt: 'Camera slowly zooms in with dramatic lighting and depth of field',
  model: 'veo-3.1-generate-preview', // Premium quality
  duration: 8,
  resolution: '1080p',
  reference_images: ['https://cdn.cosmicjs.com/hero-frame.jpg'],
  metadata: {
    campaign: 'q4-2024-launch',
    version: 1
  },
  folder: 'campaigns'
});
```

## Upgrading Your Content Workflow

### Before: Image-Only Workflow

```typescript
async function generateContent(prompt: string) {
  const image = await cosmic.ai.generateImage({
    prompt,
    folder: 'content'
  });
  
  return {
    type: 'image',
    url: image.media.url
  };
}
```

### After: Image + Video Workflow

```typescript
async function generateContent(
  prompt: string, 
  type: 'image' | 'video' = 'image'
) {
  if (type === 'video') {
    const video = await cosmic.ai.generateVideo({
      prompt,
      duration: 8,
      folder: 'content'
    });
    
    return {
      type: 'video',
      url: video.media.url,
      duration: video.media.metadata.duration,
      tokens: video.usage.total_tokens
    };
  }
  
  const image = await cosmic.ai.generateImage({
    prompt,
    folder: 'content'
  });
  
  return {
    type: 'image',
    url: image.media.url
  };
}

// Use it
const myVideo = await generateContent('Sunset over ocean', 'video');
const myImage = await generateContent('Sunset over ocean', 'image');
```

## Cost Management

Video generation uses significantly more tokens than images. Plan accordingly:

### Token Usage Comparison

```typescript
// DALL-E 3 Image: ~4,800 tokens
const image = await cosmic.ai.generateImage({
  prompt: 'Mountain landscape'
});

// Veo Fast Video (8s): ~288,000 tokens (60x more)
const video = await cosmic.ai.generateVideo({
  prompt: 'Mountain landscape with moving clouds',
  duration: 8
});
```

### Cost Calculation Helper

```typescript
function estimateVideoCost(
  model: 'fast' | 'standard',
  duration: 4 | 6 | 8
): number {
  const costs = {
    fast: { 4: 144000, 6: 216000, 8: 288000 },
    standard: { 4: 384000, 6: 576000, 8: 768000 }
  };
  
  return costs[model][duration];
}

// Calculate before generating
const cost = estimateVideoCost('fast', 8);
console.log(`This video will cost ${cost.toLocaleString()} tokens`);

// Check if you have enough tokens
const monthlyTokens = 150000000; // Pro Plan
const videosAvailable = Math.floor(monthlyTokens / cost);
console.log(`You can generate ${videosAvailable} videos with your plan`);
```

## Error Handling Upgrades

### Add Video-Specific Error Handling

```typescript
async function generateVideoSafely(prompt: string) {
  try {
    const video = await cosmic.ai.generateVideo({
      prompt,
      duration: 8
    });
    
    return { success: true, video };
    
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific video generation errors
      if (error.message.includes('token')) {
        return { 
          success: false, 
          error: 'Insufficient tokens. Video generation requires 288K tokens.' 
        };
      }
      
      if (error.message.includes('reference_images')) {
        return { 
          success: false, 
          error: 'Could not fetch reference images. Check URLs are accessible.' 
        };
      }
      
      if (error.message.includes('duration')) {
        return { 
          success: false, 
          error: 'Invalid duration. Must be 4, 6, or 8 seconds.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Video generation failed. Please try again.' 
    };
  }
}
```

## Integration with Object Metadata

### Store Video URLs in Your Content

```typescript
// Generate video and save to content object
async function createProductWithVideo(productData: any) {
  // Generate product video
  const video = await cosmic.ai.generateVideo({
    prompt: `${productData.name} rotating smoothly with professional lighting`,
    duration: 8,
    reference_images: [productData.imageUrl],
    metadata: {
      product_id: productData.id,
      generated_at: new Date().toISOString()
    },
    folder: 'product-videos'
  });
  
  // Create product object with video URL
  await cosmic.objects.insertOne({
    title: productData.name,
    type: 'products',
    metadata: {
      description: productData.description,
      price: productData.price,
      image_url: productData.imageUrl,
      // Add video URL
      video_url: video.media.url,
      video_duration: video.media.metadata.duration,
      // Track tokens used
      video_generation_cost: video.usage.total_tokens
    }
  });
}
```

## Progressive Enhancement

Start with images, add videos for premium content:

```typescript
async function generateMediaForPlan(
  prompt: string,
  userPlan: 'free' | 'starter' | 'pro'
) {
  // Free: Images only
  if (userPlan === 'free') {
    return await cosmic.ai.generateImage({ prompt });
  }
  
  // Starter: Short videos
  if (userPlan === 'starter') {
    return await cosmic.ai.generateVideo({
      prompt,
      duration: 4, // Shorter = less cost
      resolution: '720p'
    });
  }
  
  // Pro: Premium videos
  return await cosmic.ai.generateVideo({
    prompt,
    model: 'veo-3.1-generate-preview',
    duration: 8,
    resolution: '1080p'
  });
}
```

## Testing Your Integration

### Simple Test

```typescript
async function testVideoGeneration() {
  console.log('Testing video generation...');
  
  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'A simple test video of a rotating cube',
      duration: 4 // Short for quick testing
    });
    
    console.log('✅ Video generated successfully!');
    console.log('URL:', video.media.url);
    console.log('Tokens used:', video.usage.total_tokens);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}
```

## Need Help?

- **Documentation**: See `docs/AI_VIDEO_GENERATION.md` for detailed examples
- **Examples**: Check `examples/video-generation.js` and `examples/video-generation.ts`
- **Support**: [Contact Cosmic Support](https://www.cosmicjs.com/contact)
- **Community**: [Join Discord](https://discord.gg/MSCwQ7D6Mg)

## Breaking Changes

**None!** This is a backwards-compatible feature addition. All existing code continues to work unchanged.

## What's Next?

Explore advanced features:
- Image-to-video mode with reference images
- Batch video generation
- Custom metadata for organization
- Integration with your content workflow

Happy video generating! 🎬

