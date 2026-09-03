/**
 * Cosmic SDK - Video Generation Examples
 * 
 * This file demonstrates various ways to use the AI video generation
 * feature powered by Google's Veo 3.1 models.
 */

import { createBucketClient } from '@cosmicjs/sdk';

// Initialize the Cosmic client
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  readKey: process.env.COSMIC_READ_KEY,
  writeKey: process.env.COSMIC_WRITE_KEY,
});

/**
 * Example 1: Basic Video Generation
 * Creates a simple 8-second video at 720p using the fast model
 */
async function basicVideoGeneration() {
  console.log('Example 1: Basic Video Generation');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'A calico kitten playing with a ball of yarn in golden sunlight',
      duration: 8,
      resolution: '720p'
    });

    console.log('✓ Video generated successfully!');
    console.log(`  URL: ${video.media.url}`);
    console.log(`  Duration: ${video.media.metadata.duration}s`);
    console.log(`  Resolution: ${video.media.metadata.resolution}`);
    console.log(`  Tokens used: ${video.usage.total_tokens.toLocaleString()}`);
    console.log(`  Generation time: ${video.generation_time_seconds}s`);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 2: Premium Quality Video
 * Uses the Standard model for cinematic quality output
 */
async function premiumVideoGeneration() {
  console.log('\nExample 2: Premium Quality Video');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'Cinematic close-up of raindrops falling on a window at night, city lights blurred in the background',
      model: 'veo-3.1-generate-preview', // Premium quality
      duration: 8,
      resolution: '1080p',
      folder: 'premium-videos'
    });

    console.log('✓ Premium video generated!');
    console.log(`  URL: ${video.media.url}`);
    console.log(`  Folder: ${video.media.folder}`);
    console.log(`  Tokens used: ${video.usage.total_tokens.toLocaleString()}`);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 3: Image-to-Video Generation
 * Uses a reference image as the starting frame
 */
async function imageToVideoGeneration() {
  console.log('\nExample 3: Image-to-Video Generation');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'Product rotates smoothly revealing all angles with soft studio lighting',
      duration: 6,
      resolution: '720p',
      reference_images: [
        'https://cdn.cosmicjs.com/product-hero.jpg' // Your product image URL
      ],
      metadata: {
        product_id: 'prod_123',
        campaign: 'product-launch-2024'
      },
      folder: 'product-videos'
    });

    console.log('✓ Image-to-video generated!');
    console.log(`  URL: ${video.media.url}`);
    console.log(`  Custom metadata:`, video.media.metadata);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 4: Multiple Reference Images
 * Uses up to 3 reference images for style and content guidance
 */
async function multiReferenceVideoGeneration() {
  console.log('\nExample 4: Multiple Reference Images');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'Character walks through a vibrant marketplace with people and colors matching the reference style',
      duration: 8,
      resolution: '720p',
      reference_images: [
        'https://cdn.cosmicjs.com/character-ref-1.jpg',
        'https://cdn.cosmicjs.com/style-reference.jpg',
        'https://cdn.cosmicjs.com/color-palette.jpg'
      ]
    });

    console.log('✓ Multi-reference video generated!');
    console.log(`  URL: ${video.media.url}`);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 5: Short Duration Video (Budget-Friendly)
 * Generates a 4-second video for lower cost
 */
async function shortVideoGeneration() {
  console.log('\nExample 5: Short Duration Video');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'A serene mountain landscape at sunset with gentle wind rustling through trees',
      model: 'veo-3.1-fast-generate-preview',
      duration: 4, // Shorter = less cost
      resolution: '720p'
    });

    console.log('✓ Short video generated!');
    console.log(`  URL: ${video.media.url}`);
    console.log(`  Duration: ${video.media.metadata.duration}s`);
    console.log(`  Tokens used: ${video.usage.total_tokens.toLocaleString()}`);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 6: Social Media Content
 * Creates engaging short-form content for Instagram Reels, TikTok
 */
async function socialMediaVideo() {
  console.log('\nExample 6: Social Media Content');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'Time-lapse of sunrise over city skyline with vibrant colors, perfect for social media',
      duration: 6,
      resolution: '1080p',
      metadata: {
        platform: 'instagram',
        content_type: 'reel',
        tags: ['sunrise', 'cityscape', 'time-lapse']
      },
      folder: 'social-media'
    });

    console.log('✓ Social media video generated!');
    console.log(`  URL: ${video.media.url}`);
    console.log(`  Optimized for: ${video.media.metadata.platform}`);

    return video;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

/**
 * Example 7: Batch Video Generation
 * Generate multiple videos in sequence
 */
async function batchVideoGeneration() {
  console.log('\nExample 7: Batch Video Generation');

  const prompts = [
    'A flower blooming in fast motion with morning dew',
    'Ocean waves crashing on a rocky shore at sunset',
    'City traffic time-lapse with light trails at night'
  ];

  const videos = [];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`\n  Generating video ${i + 1}/${prompts.length}...`);

    try {
      const video = await cosmic.ai.generateVideo({
        prompt: prompts[i],
        duration: 6,
        resolution: '720p',
        metadata: {
          batch_id: 'nature-series-2024',
          video_number: i + 1
        },
        folder: 'nature-series'
      });

      console.log(`  ✓ Video ${i + 1} generated: ${video.media.url}`);
      videos.push(video);

    } catch (error) {
      console.error(`  ✗ Video ${i + 1} failed:`, error.message);
    }
  }

  console.log(`\n✓ Batch complete! Generated ${videos.length}/${prompts.length} videos`);
  return videos;
}

/**
 * Example 8: Error Handling
 * Demonstrates proper error handling for video generation
 */
async function videoGenerationWithErrorHandling() {
  console.log('\nExample 8: Error Handling');

  try {
    const video = await cosmic.ai.generateVideo({
      prompt: 'A peaceful zen garden with raking sand patterns',
      duration: 8,
      resolution: '720p'
    });

    console.log('✓ Video generated successfully');
    console.log(`  URL: ${video.media.url}`);

    return video;

  } catch (error) {
    // Handle different types of errors
    if (error.message.includes('token')) {
      console.error('✗ Insufficient tokens. Please check your account balance.');
    } else if (error.message.includes('prompt')) {
      console.error('✗ Invalid prompt. Please provide a valid video description.');
    } else if (error.message.includes('duration')) {
      console.error('✗ Invalid duration. Must be 4, 6, or 8 seconds.');
    } else if (error.message.includes('resolution')) {
      console.error('✗ Invalid resolution. Must be 720p or 1080p.');
    } else if (error.message.includes('reference_images')) {
      console.error('✗ Failed to fetch reference images. Check URLs are accessible.');
    } else {
      console.error('✗ Video generation failed:', error.message);
    }

    throw error;
  }
}

/**
 * Example 9: Calculate Costs Before Generation
 * Estimate token costs before generating videos
 */
function calculateVideoCosts() {
  console.log('\nExample 9: Token Cost Calculation');

  const costs = {
    fast: {
      '4s': 144000,
      '6s': 216000,
      '8s': 288000
    },
    standard: {
      '4s': 384000,
      '6s': 576000,
      '8s': 768000
    }
  };

  console.log('\nVeo 3.1 Fast (Recommended):');
  console.log(`  4 seconds: ${costs.fast['4s'].toLocaleString()} tokens`);
  console.log(`  6 seconds: ${costs.fast['6s'].toLocaleString()} tokens`);
  console.log(`  8 seconds: ${costs.fast['8s'].toLocaleString()} tokens`);

  console.log('\nVeo 3.1 Standard (Premium):');
  console.log(`  4 seconds: ${costs.standard['4s'].toLocaleString()} tokens`);
  console.log(`  6 seconds: ${costs.standard['6s'].toLocaleString()} tokens`);
  console.log(`  8 seconds: ${costs.standard['8s'].toLocaleString()} tokens`);

  // Example: Calculate how many videos you can generate
  const monthlyTokens = 150000000; // Pro Plan: 150M tokens
  const fastVideos = Math.floor(monthlyTokens / costs.fast['8s']);
  const standardVideos = Math.floor(monthlyTokens / costs.standard['8s']);

  console.log(`\nWith 150M tokens/month (Pro Plan):`);
  console.log(`  Fast videos (8s): ${fastVideos} videos`);
  console.log(`  Standard videos (8s): ${standardVideos} videos`);
}

// Run all examples
async function runAllExamples() {
  console.log('='.repeat(60));
  console.log('Cosmic SDK - Video Generation Examples');
  console.log('='.repeat(60));

  try {
    // Run cost calculation (no API calls)
    calculateVideoCosts();

    // Uncomment the examples you want to run:

    // await basicVideoGeneration();
    // await premiumVideoGeneration();
    // await imageToVideoGeneration();
    // await multiReferenceVideoGeneration();
    // await shortVideoGeneration();
    // await socialMediaVideo();
    // await batchVideoGeneration();
    // await videoGenerationWithErrorHandling();

    console.log('\n' + '='.repeat(60));
    console.log('Examples completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nFatal error:', error);
    process.exit(1);
  }
}

// Export functions for use in other modules
export {
  basicVideoGeneration,
  premiumVideoGeneration,
  imageToVideoGeneration,
  multiReferenceVideoGeneration,
  shortVideoGeneration,
  socialMediaVideo,
  batchVideoGeneration,
  videoGenerationWithErrorHandling,
  calculateVideoCosts,
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

