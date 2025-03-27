import { EventEmitter } from 'events';
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
  media: {
    id: string;
    name: string;
    original_name: string;
    size: number;
    type: string;
    bucket: string;
    created_at: string;
    created_by: string | null;
    modified_at: string;
    modified_by: string | null;
    width: number;
    height: number;
    alt_text?: string;
    url: string;
    imgix_url: string;
    metadata?: Record<string, any>;
    folder?: string | null;
  };
  revised_prompt: string;
}

/**
 * A class for handling streaming text generation responses
 * with an Anthropic-like API.
 */
export class TextStreamingResponse extends EventEmitter {
  private fullText: string = '';

  private usageInfo: any = null;

  constructor(private stream: any) {
    super();
    this.setupListeners();
  }

  private setupListeners() {
    this.stream.on('data', (chunk: Buffer) => {
      // Handle SSE format
      const chunkStr = chunk.toString();
      const jsonStr = chunkStr.replace(/^data: /, '');

      try {
        const data = JSON.parse(jsonStr);
        if (data.error) {
          this.emit(
            'error',
            new Error(data.error.message || 'An error occurred')
          );
          return;
        }
        if (data.text) {
          this.fullText += data.text;
          this.emit('text', data.text);
        }

        if (data.token_count) {
          this.usageInfo = data.token_count;
          this.emit('usage', data.token_count);
        }
        if (data.event === 'end') {
          this.emit('end', data.data);
        }
      } catch (error) {
        // If we can't parse the chunk, it might be an error message
        if (chunkStr.includes('error')) {
          this.emit('error', new Error(chunkStr));
        }
      }
    });

    this.stream.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

  /**
   * Get the full text generated so far
   */
  get text(): string {
    return this.fullText;
  }

  /**
   * Get the usage information if available
   */
  get usage(): any {
    return this.usageInfo;
  }
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
    ): Promise<TextGenerationResponse | TextStreamingResponse> => {
      if (!options.prompt && !options.messages) {
        throw new Error('Either prompt or messages must be provided');
      }
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/text`;

      if (options.stream) {
        const stream = await requestHandler(
          'POST',
          endpoint,
          options,
          headers,
          true
        );
        return new TextStreamingResponse(stream);
      }

      return requestHandler('POST', endpoint, options, headers);
    },

    /**
     * Stream text generation with an Anthropic-like API
     */
    stream: async (
      options: Omit<GenerateTextOptions, 'stream'>
    ): Promise<TextStreamingResponse> => {
      if (!options.prompt && !options.messages) {
        throw new Error('Either prompt or messages must be provided');
      }
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/text`;
      const stream = await requestHandler(
        'POST',
        endpoint,
        { ...options, stream: true },
        headers,
        true
      );
      return new TextStreamingResponse(stream);
    },

    generateImage: async (
      options: GenerateImageOptions
    ): Promise<ImageGenerationResponse> => {
      const endpoint = `${uploadUrl}/buckets/${bucketSlug}/ai/image`;
      return requestHandler('POST', endpoint, options, headers);
    },
  };
};
