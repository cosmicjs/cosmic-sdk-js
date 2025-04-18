<a href="https://app.cosmicjs.com/signup">
  <img src="https://imgix.cosmicjs.com/ca74e2f0-c8e4-11ed-b01d-23d7b265c299-cosmic-dashboard-dark.png?w=2000&auto=format" alt="Cosmic dashboard darkmode" />
</a>

<h1 align="center">Cosmic JavaScript SDK</h1>

[Cosmic](https://www.cosmicjs.com/) is a [headless CMS](https://www.cosmicjs.com/headless-cms) (content management system) that provides a web dashboard to create content and an API toolkit to deliver content to any website or application. Nearly any type of content can be built using the dashboard and delivered using this SDK.

[Get started free →](https://app.cosmicjs.com/signup)

## Install

Install the Cosmic JavaScript SDK. We recommend using the [bun](https://bun.sh) package manager.

```bash
bun add @cosmicjs/sdk
# OR
yarn add @cosmicjs/sdk
# OR
npm install @cosmicjs/sdk
```

## Import

Import Cosmic into your app using the `createBucketClient` method.

```jsx
import { createBucketClient } from '@cosmicjs/sdk';
```

## Authentication

In the [Cosmic admin dashboard](https://app.cosmicjs.com/login) go to _Bucket > Settings > API Access_ and get your Bucket slug and read key then set the variables in your app to connect to your Bucket.

```jsx
const cosmic = createBucketClient({
  bucketSlug: 'BUCKET_SLUG',
  readKey: 'BUCKET_READ_KEY',
});
```

## Get Objects

Objects are the basic building blocks of content in Cosmic.

### Get multiple Objects [[see docs](https://www.cosmicjs.com/docs/api/objects#get-objects)]

Use the `objects.find()` method to fetch Objects.

```jsx
const posts = await cosmic.objects
  .find({
    type: 'posts',
  })
  .props(['title', 'slug', 'metadata'])
  .limit(10);
```

The above example fetches Objects in the `posts` Object type returning the `title`, `slug`, and `metadata` properties, limiting the response to `10` Objects.

### Get single Object by slug [[see docs](https://www.cosmicjs.com/docs/api/objects#get-a-single-object-by-slug)]

Use the `objects.findOne()` method with `type` and `slug` to fetch a single Object.

```jsx
const post = await cosmic.objects
  .findOne({
    type: 'pages',
    slug: 'home',
  })
  .props(['title', 'slug', 'metadata']);
```

## Create, update, and delete Objects

To write to the Cosmic API, you will need to set the Bucket write key found in _Bucket > Settings > API Access_. (NOTE: never expose your write key in any client-side code)

```jsx
const cosmic = createBucketClient({
  bucketSlug: 'BUCKET_SLUG',
  readKey: 'BUCKET_READ_KEY',
  writeKey: 'BUCKET_WRITE_KEY',
});
```

### Create Object [[see docs](https://www.cosmicjs.com/docs/api/objects#create-an-object)]

Use the `objects.insertOne()` method to create an Object.

```jsx
await cosmic.objects.insertOne({
  title: 'Blog Post Title',
  type: 'posts',
  metadata: {
    content: 'Here is the blog post content... still learning',
    seo_description: 'This is the blog post SEO description.',
    featured_post: true,
    tags: ['javascript', 'cms'],
  },
});
```

### Update Object [[see docs](https://www.cosmicjs.com/docs/api/objects#update-an-object)]

Use the `objects.updateOne()` method to update an Object by specifying the Object `id` and include properties that you want to update.

```jsx
await cosmic.objects.updateOne('5ff75368c2dfa81a91695cec', {
  metadata: {
    content: 'This is the updated blog post content... I got it now!',
    featured_post: false,
  },
});
```

### Delete Object [[see docs](https://www.cosmicjs.com/docs/api/objects#delete-an-object)]

Use the `objects.deleteOne()` method to delete an Object by specifying the Object `id`.

```jsx
await cosmic.objects.deleteOne('5ff75368c2dfa81a91695cec');
```

## AI Capabilities

Cosmic provides AI-powered text and image generation capabilities through the SDK.

### Generate Text [[see docs](https://www.cosmicjs.com/docs/api/ai#generate-text)]

Use the `ai.generateText()` method to generate text content using AI models. You must provide either a `prompt` or `messages` parameter.

#### Using a simple prompt:

```jsx
const textResponse = await cosmic.ai.generateText({
  prompt: 'Write a product description for a coffee mug',
  max_tokens: 500, // optional
});

console.log(textResponse.text);
console.log(textResponse.usage); // { input_tokens: 10, output_tokens: 150 }
```

#### Using messages for chat-based models:

```jsx
const chatResponse = await cosmic.ai.generateText({
  messages: [
    { role: 'user', content: 'Tell me about coffee mugs' },
    {
      role: 'assistant',
      content: 'Coffee mugs are vessels designed to hold hot beverages...',
    },
    { role: 'user', content: 'What materials are they typically made from?' },
  ],
  max_tokens: 500, // optional
});

console.log(chatResponse.text);
console.log(chatResponse.usage);
```

#### Using streaming for real-time responses:

```jsx
import { TextStreamingResponse } from '@cosmicjs/sdk';

// Enable streaming with the stream: true parameter
const result = await cosmic.ai.generateText({
  prompt: 'Tell me about coffee mugs',
  // or use messages array format
  max_tokens: 500,
  stream: true // Enable streaming
});

// Cast the result to TextStreamingResponse
const stream = result as TextStreamingResponse;

// Option 1: Event-based approach
let fullResponse = '';
stream.on('text', (text) => {
  fullResponse += text;
  process.stdout.write(text); // Display text as it arrives
});
stream.on('usage', (usage) => console.log('Usage:', usage));
stream.on('end', (data) => console.log('Complete:', fullResponse));
stream.on('error', (error) => console.error('Error:', error));

// Option 2: For-await loop approach
async function processStream() {
  let fullResponse = '';
  try {
    for await (const chunk of stream) {
      if (chunk.text) {
        fullResponse += chunk.text;
        process.stdout.write(chunk.text);
      }
    }
    console.log('\nComplete text:', fullResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Using the simplified stream method

```jsx
// Simplified streaming method
const stream = await cosmic.ai.stream({
  prompt: 'Tell me about coffee mugs',
  max_tokens: 500,
});

// Process stream using events or for-await loop as shown above
```

The `TextStreamingResponse` supports two usage patterns:

1. **Event-based**: Extends EventEmitter with these events:

   - `text`: New text fragments
   - `usage`: Token usage information
   - `end`: Final data when stream completes
   - `error`: Stream errors

2. **AsyncIterator**: For for-await loops, with chunk objects containing:
   - `text`: Text fragments
   - `usage`: Token usage information
   - `end`: Set to true for the final chunk
   - `error`: Error information

### Analyze Images and Files

The AI model can analyze images and files when generating text responses. This feature works with both the `prompt` and `messages` approaches.

```jsx
const textWithImageResponse = await cosmic.ai.generateText({
  prompt: 'Describe this coffee mug and suggest improvements to its design',
  media_url: 'https://imgix.cosmicjs.com/your-image-url.jpg',
  max_tokens: 500,
});

console.log(textWithImageResponse.text);
console.log(textWithImageResponse.usage);
```

### Generate Image [[see docs](https://www.cosmicjs.com/docs/api/ai#generate-image)]

Use the `ai.generateImage()` method to create AI-generated images based on text prompts.

```jsx
const imageResponse = await cosmic.ai.generateImage({
  prompt: 'A serene mountain landscape at sunset',
  // Optional parameters
  metadata: { tags: ['landscape', 'mountains', 'sunset'] },
  folder: 'ai-generated-images',
  alt_text: 'A beautiful mountain landscape with a colorful sunset',
});

// Access the generated image properties
console.log(imageResponse.media.url); // Direct URL to the generated image
console.log(imageResponse.media.imgix_url); // Imgix-enhanced URL for additional transformations
console.log(imageResponse.media.width); // Image width
console.log(imageResponse.media.height); // Image height
console.log(imageResponse.media.alt_text); // Alt text for the image
console.log(imageResponse.revised_prompt); // Potentially revised prompt used by the AI
```

## Learn more

Go to the [Cosmic docs](https://www.cosmicjs.com/docs) to learn more capabilities.

## Community support

For additional help, you can use one of these channels to ask a question:

- [Discord](https://discord.gg/MSCwQ7D6Mg) (Development questions, bug reports)
- [GitHub](https://github.com/cosmicjs/cosmic-sdk-js) (Issues, contributions)
- [X (formerly Twitter)](https://twitter.com/cosmicjs) (Get the latest news about Cosmic features and notifications)
- [YouTube](https://www.youtube.com/cosmicjs) (Learn from video tutorials)

## Cosmic support

- [Contact us](https://www.cosmicjs.com/contact) for help with any service questions and custom plan inquiries.

## Contributing

This project uses [changeset](https://www.npmjs.com/package/@changesets/cli) to manage releases. Follow the following steps to add a changeset:

- Run `npm run changeset` command and select type of release with description of changes.
- When PR with changeset is merged into `main` branch, Github will create a new PR with correct version change and changelog edits.
- When `codeowner` merges the generated PR, it will publish the package and create a Github release.

## License

This project is published under the [MIT](https://github.com/cosmicjs/cosmic-sdk-js/blob/HEAD/LICENSE) license.
