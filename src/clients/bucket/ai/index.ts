import { BucketConfig, APIConfig } from '../../../types/config.types';
import { requestHandler } from '../../../utils/request.handler';

export interface GenerateTextOptions {
  prompt?: string;
  media_url?: string;
  model?: string;
  max_tokens?: number;
  stream?: boolean;
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface GenerateImageOptions {
  prompt: string;
  model?: string;
  metadata?: Record<string, any>;
  folder?: string;
  alt_text?: string;
}

export interface TextGenerationResponse {
  text: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ImageGenerationResponse {
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
      if (!options.prompt && !options.messages) {
        throw new Error('Either prompt or messages must be provided');
      }
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/text`;
      return requestHandler('POST', endpoint, options, headers);
    },

    generateImage: async (
      options: GenerateImageOptions
    ): Promise<ImageGenerationResponse> => {
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/image`;
      return requestHandler('POST', endpoint, options, headers);
    },
  };
};
