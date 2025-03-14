import { BucketConfig, APIConfig } from '../../../types/config.types';

interface GenerateTextOptions {
  prompt: string;
  media_url?: string;
  model?: string;
  max_tokens?: number;
  stream?: boolean;
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface GenerateImageOptions {
  prompt: string;
  model?: string;
}

interface TextGenerationResponse {
  text: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ImageGenerationResponse {
  image: {
    id: string;
    url: string;
    imgix_url: string;
    prompt: string;
    revised_prompt: string;
  };
}

export const aiChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => {
  const { uploadUrl } = apiConfig;
  const { bucketSlug, writeKey } = bucketConfig;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (writeKey) {
    headers.Authorization = `Bearer ${writeKey}`;
  }

  return {
    generateText: async (
      options: GenerateTextOptions
    ): Promise<TextGenerationResponse> => {
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/text`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate text');
      }

      return response.json();
    },

    generateImage: async (
      options: GenerateImageOptions
    ): Promise<ImageGenerationResponse> => {
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/image`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }

      return response.json();
    },
  };
};
