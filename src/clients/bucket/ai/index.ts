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
  private usageInfo: any = null;

  constructor(private stream: any) {
    super();
    this.setupListeners();
  }

  private setupListeners() {
    let buffer = '';

    this.stream.on('data', (chunk: Buffer) => {
      // Add the new chunk to the buffer
      buffer += chunk.toString();

      // Process complete events (each SSE message ends with \n\n)
      const events = buffer.split('\n\n');

      // Keep the last potentially incomplete event in the buffer
      buffer = events.pop() || '';

      // Process each complete event
      for (const event of events) {
        if (event.trim()) {
          // Handle SSE format - each line starts with 'data: '
          const lines = event
            .split('\n')
            .filter((line) => line.startsWith('data: '))
            .map((line) => line.replace(/^data: /, ''));

          for (const jsonStr of lines) {
            try {
              const data = JSON.parse(jsonStr);

              if (data.error) {
                this.emit(
                  'error',
                  new Error(data.error.message || 'An error occurred')
                );
              } else {
                // Only process non-error data
                if (data.text) {
                  this.emit('text', data.text);
                }

                if (data.token_count) {
                  this.usageInfo = data.token_count;
                  this.emit('usage', data.token_count);
                }

                if (data.event === 'end') {
                  this.emit('end', data.data);
                }
              }
            } catch (error) {
              // If we can't parse the chunk, it might be an error message
              if (jsonStr.includes('error')) {
                this.emit('error', new Error(jsonStr));
              }
            }
          }
        }
      }
    });

    this.stream.on('error', (error: Error) => {
      this.emit('error', error);
    });

    // Handle stream end
    this.stream.on('end', () => {
      // Process any remaining data in the buffer
      if (buffer.trim()) {
        const lines = buffer
          .split('\n')
          .filter((line) => line.startsWith('data: '))
          .map((line) => line.replace(/^data: /, ''));

        for (const jsonStr of lines) {
          try {
            const data = JSON.parse(jsonStr);
            if (data.text) {
              this.emit('text', data.text);
            }
            if (data.event === 'end') {
              this.emit('end', data.data);
            }
          } catch (error) {
            // Ignore parsing errors at the end of the stream
          }
        }
      }

      // If we haven't already emitted an end event, do it now
      this.emit('end', { usage: this.usageInfo });
    });
  }

  /**
   * Get the usage information if available
   */
  get usage(): any {
    return this.usageInfo;
  }

  /**
   * Implement AsyncIterator interface to support for-await loops
   */
  [Symbol.asyncIterator]() {
    // Create a queue to store chunks
    const chunks: Array<{
      text?: string;
      usage?: any;
      end?: boolean;
      error?: Error;
    }> = [];
    let resolvePromise: ((value: IteratorResult<any>) => void) | null = null;
    let isDone = false;
    let hasError = false;

    // Set up event listeners
    this.on('text', (text: string) => {
      if (resolvePromise) {
        resolvePromise({ value: { text }, done: false });
        resolvePromise = null;
      } else {
        chunks.push({ text });
      }
    });

    this.on('usage', (usage: any) => {
      if (resolvePromise) {
        resolvePromise({ value: { usage }, done: false });
        resolvePromise = null;
      } else {
        chunks.push({ usage });
      }
    });

    this.on('end', () => {
      isDone = true;
      if (resolvePromise) {
        resolvePromise({ value: undefined, done: true });
        resolvePromise = null;
      }
    });

    this.on('error', (error: Error) => {
      hasError = true;
      if (resolvePromise) {
        resolvePromise({ value: { error }, done: false });
        resolvePromise = null;
      } else {
        chunks.push({ error });
      }
    });

    // Return an async iterator
    return {
      next: async (): Promise<IteratorResult<any>> => {
        if (chunks.length > 0) {
          const chunk = chunks.shift()!;
          if (chunk.error) {
            throw chunk.error;
          }
          return { value: chunk, done: false };
        }

        if (isDone) {
          return { value: undefined, done: true };
        }

        if (hasError) {
          throw new Error('Stream encountered an error');
        }

        // Wait for the next chunk
        return new Promise<IteratorResult<any>>((resolve) => {
          resolvePromise = resolve;
        });
      },
    };
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
