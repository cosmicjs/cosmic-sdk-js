/**
 * Cosmic SDK - Video Generation TypeScript Examples
 * 
 * This file demonstrates type-safe video generation using the Cosmic SDK
 * with Google's Veo 3.1 models.
 */

import {
  createBucketClient,
  GenerateVideoOptions,
  VideoGenerationResponse,
} from '@cosmicjs/sdk';

// Initialize the Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG || '',
  readKey: process.env.COSMIC_READ_KEY || '',
  writeKey: process.env.COSMIC_WRITE_KEY || '',
});

/**
 * Example 1: Type-Safe Basic Video Generation
 */
async function typeSafeBasicVideo(): Promise<VideoGenerationResponse> {
  const options: GenerateVideoOptions = {
    prompt: 'A serene mountain landscape at sunset with gentle wind rustling through trees',
    duration: 8,
    resolution: '720p',
  };

  const video = await cosmic.ai.generateVideo(options);

  // TypeScript knows the exact shape of the response
  console.log(`Video ID: ${video.media.id}`);
  console.log(`Video URL: ${video.media.url}`);
  console.log(`Duration: ${video.media.metadata?.duration}s`);
  console.log(`Resolution: ${video.media.metadata?.resolution}`);
  console.log(`Tokens: ${video.usage.total_tokens}`);

  return video;
}

/**
 * Example 2: Type-Safe Model Selection
 */
async function typeSafeModelSelection(): Promise<VideoGenerationResponse> {
  // TypeScript ensures only valid models are used
  const fastOptions: GenerateVideoOptions = {
    prompt: 'Fast generation video',
    model: 'veo-3.1-fast-generate-preview',
    duration: 6,
  };

  const standardOptions: GenerateVideoOptions = {
    prompt: 'Premium quality video',
    model: 'veo-3.1-generate-preview',
    duration: 8,
    resolution: '1080p',
  };

  // This would cause a TypeScript error:
  // const invalidOptions: GenerateVideoOptions = {
  //   prompt: 'Invalid model',
  //   model: 'invalid-model', // TS Error!
  // };

  const video = await cosmic.ai.generateVideo(fastOptions);
  return video;
}

/**
 * Example 3: Type-Safe Duration and Resolution
 */
async function typeSafeDurationResolution(): Promise<VideoGenerationResponse> {
  const options: GenerateVideoOptions = {
    prompt: 'Type-safe video options',
    duration: 8, // TypeScript ensures only 4, 6, or 8
    resolution: '1080p', // TypeScript ensures only '720p' or '1080p'
  };

  // These would cause TypeScript errors:
  // duration: 5,        // TS Error! Must be 4, 6, or 8
  // resolution: '480p', // TS Error! Must be '720p' or '1080p'

  const video = await cosmic.ai.generateVideo(options);
  return video;
}

/**
 * Example 4: Type-Safe Reference Images
 */
async function typeSafeReferenceImages(): Promise<VideoGenerationResponse> {
  const options: GenerateVideoOptions = {
    prompt: 'Product showcase with reference images',
    duration: 8,
    reference_images: [
      'https://cdn.cosmicjs.com/image1.jpg',
      'https://cdn.cosmicjs.com/image2.jpg',
      'https://cdn.cosmicjs.com/image3.jpg',
    ],
    metadata: {
      product_id: 'prod_123',
      campaign: 'launch-2024',
      tags: ['product', 'showcase'],
    },
  };

  const video = await cosmic.ai.generateVideo(options);

  // Access metadata with type safety
  if (video.media.metadata) {
    console.log(`Duration: ${video.media.metadata.duration}`);
    console.log(`Resolution: ${video.media.metadata.resolution}`);
    console.log(`Generation time: ${video.media.metadata.generation_time_seconds}s`);

    // Custom metadata is also available
    console.log(`Custom metadata:`, video.media.metadata);
  }

  return video;
}

/**
 * Example 5: Type-Safe Error Handling
 */
async function typeSafeErrorHandling(): Promise<VideoGenerationResponse | null> {
  try {
    const options: GenerateVideoOptions = {
      prompt: 'A peaceful zen garden with raking sand patterns',
      duration: 8,
      resolution: '720p',
    };

    const video = await cosmic.ai.generateVideo(options);
    return video;

  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error('Error:', error.message);

      // Handle specific error types
      if (error.message.includes('token')) {
        console.error('Insufficient tokens available');
      } else if (error.message.includes('prompt')) {
        console.error('Invalid prompt provided');
      }
    }

    return null;
  }
}

/**
 * Example 6: Building a Video Generation Service
 */
class VideoGenerationService {
  private readonly cosmic = createBucketClient({
    bucketSlug: process.env.COSMIC_BUCKET_SLUG || '',
    readKey: process.env.COSMIC_READ_KEY || '',
    writeKey: process.env.COSMIC_WRITE_KEY || '',
  });

  /**
   * Generate a product video with type safety
   */
  async generateProductVideo(
    productName: string,
    productImageUrl: string,
    productId: string
  ): Promise<VideoGenerationResponse> {
    const options: GenerateVideoOptions = {
      prompt: `${productName} rotates smoothly revealing all angles with soft studio lighting`,
      duration: 8,
      resolution: '720p',
      reference_images: [productImageUrl],
      metadata: {
        product_id: productId,
        product_name: productName,
        generated_at: new Date().toISOString(),
      },
      folder: 'product-videos',
    };

    return await this.cosmic.ai.generateVideo(options);
  }

  /**
   * Generate a social media video
   */
  async generateSocialVideo(
    prompt: string,
    platform: 'instagram' | 'tiktok' | 'youtube'
  ): Promise<VideoGenerationResponse> {
    const options: GenerateVideoOptions = {
      prompt,
      duration: platform === 'youtube' ? 8 : 6,
      resolution: '1080p',
      metadata: {
        platform,
        content_type: 'social_media',
        generated_at: new Date().toISOString(),
      },
      folder: 'social-media',
    };

    return await this.cosmic.ai.generateVideo(options);
  }

  /**
   * Batch generate videos with type safety
   */
  async batchGenerate(
    prompts: string[],
    options?: Partial<GenerateVideoOptions>
  ): Promise<VideoGenerationResponse[]> {
    const videos: VideoGenerationResponse[] = [];

    for (const prompt of prompts) {
      try {
        const videoOptions: GenerateVideoOptions = {
          prompt,
          duration: 6,
          resolution: '720p',
          ...options,
        };

        const video = await this.cosmic.ai.generateVideo(videoOptions);
        videos.push(video);
      } catch (error) {
        console.error(`Failed to generate video for prompt: ${prompt}`, error);
      }
    }

    return videos;
  }

  /**
   * Get video generation cost estimate
   */
  calculateCost(
    model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview',
    duration: 4 | 6 | 8
  ): number {
    const costs = {
      'veo-3.1-fast-generate-preview': {
        4: 144000,
        6: 216000,
        8: 288000,
      },
      'veo-3.1-generate-preview': {
        4: 384000,
        6: 576000,
        8: 768000,
      },
    };

    return costs[model][duration];
  }
}

/**
 * Example 7: Using the Service Class
 */
async function useVideoService(): Promise<void> {
  const service = new VideoGenerationService();

  // Generate a product video
  const productVideo = await service.generateProductVideo(
    'Premium Coffee Mug',
    'https://cdn.cosmicjs.com/coffee-mug.jpg',
    'prod_123'
  );

  console.log('Product video:', productVideo.media.url);

  // Generate a social media video
  const socialVideo = await service.generateSocialVideo(
    'Time-lapse of sunrise over city skyline',
    'instagram'
  );

  console.log('Social video:', socialVideo.media.url);

  // Calculate costs
  const fastCost = service.calculateCost('veo-3.1-fast-generate-preview', 8);
  const standardCost = service.calculateCost('veo-3.1-generate-preview', 8);

  console.log(`Fast model (8s): ${fastCost.toLocaleString()} tokens`);
  console.log(`Standard model (8s): ${standardCost.toLocaleString()} tokens`);

  // Batch generation
  const prompts = [
    'A flower blooming in fast motion',
    'Ocean waves at sunset',
    'City lights at night',
  ];

  const videos = await service.batchGenerate(prompts, {
    duration: 6,
    folder: 'batch-videos',
  });

  console.log(`Generated ${videos.length} videos`);
}

/**
 * Example 8: Advanced Type Usage
 */
interface CustomVideoMetadata {
  project_name: string;
  scene_number: number;
  take: number;
  director: string;
  tags: string[];
}

async function advancedTypedVideo(): Promise<VideoGenerationResponse> {
  const customMetadata: CustomVideoMetadata = {
    project_name: 'Nature Documentary',
    scene_number: 42,
    take: 3,
    director: 'Jane Doe',
    tags: ['nature', 'wildlife', 'documentary'],
  };

  const options: GenerateVideoOptions = {
    prompt: 'A majestic eagle soaring over mountain peaks',
    duration: 8,
    resolution: '1080p',
    model: 'veo-3.1-generate-preview',
    metadata: customMetadata,
    folder: 'documentaries',
  };

  const video = await cosmic.ai.generateVideo(options);

  // Access custom metadata with type inference
  if (video.media.metadata) {
    const metadata = video.media.metadata as CustomVideoMetadata & {
      duration: number;
      resolution: string;
      generation_time_seconds: number;
    };

    console.log(`Project: ${metadata.project_name}`);
    console.log(`Scene: ${metadata.scene_number}`);
    console.log(`Take: ${metadata.take}`);
    console.log(`Tags:`, metadata.tags);
  }

  return video;
}

/**
 * Example 9: Type Guards for Response Validation
 */
function isValidVideoResponse(
  response: unknown
): response is VideoGenerationResponse {
  if (typeof response !== 'object' || response === null) return false;

  const r = response as any;

  return (
    typeof r.media === 'object' &&
    typeof r.media.id === 'string' &&
    typeof r.media.url === 'string' &&
    typeof r.usage === 'object' &&
    typeof r.usage.total_tokens === 'number'
  );
}

async function validateVideoResponse(): Promise<void> {
  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'A serene lake at dawn',
      duration: 6,
    });

    if (isValidVideoResponse(video)) {
      console.log('Valid response:', video.media.url);
    } else {
      console.error('Invalid response structure');
    }
  } catch (error) {
    console.error('Generation failed:', error);
  }
}

// Export everything
export {
  typeSafeBasicVideo,
  typeSafeModelSelection,
  typeSafeDurationResolution,
  typeSafeReferenceImages,
  typeSafeErrorHandling,
  VideoGenerationService,
  useVideoService,
  advancedTypedVideo,
  isValidVideoResponse,
  validateVideoResponse,
};

// Run examples if executed directly
if (require.main === module) {
  (async () => {
    console.log('Running TypeScript Video Generation Examples...\n');

    await typeSafeBasicVideo();
    await useVideoService();

    console.log('\nExamples completed!');
  })();
}

