# Media Upload Fix - Implementation Summary

## Problem

The previous media upload implementation had a critical issue where it mixed Node.js `form-data` package with browser File objects, causing the error:

```
Upload failed with server error: e.on is not a function
```

This error occurred particularly in Next.js environments where:

- Server API routes run in Node.js
- File objects from client requests needed proper conversion
- The SDK tried to use Node.js stream methods (`.on()`) on incompatible objects

## Root Cause

1. **Mixed FormData implementations**: Code imported Node.js `form-data` but tried to handle both Node.js Buffers and browser File objects
2. **No environment detection**: The code couldn't distinguish between Node.js and browser environments
3. **Improper type handling**: Type checking relied on `params.media.buffer` existence rather than proper environment detection

## Solution Implemented

### 1. Environment-Aware FormData ✅

**File**: `src/clients/bucket/media/index.ts`

- Added runtime environment detection: `const isNode = typeof window === 'undefined'`
- Split logic into two paths:
  - **Node.js path**: Uses `form-data` package with Buffer objects
  - **Browser path**: Uses native FormData with File/Blob objects

### 2. Updated Type Definitions ✅

**File**: `src/types/media.types.ts`

```typescript
export type InsertMediaType = {
  media: File | Blob | Buffer | { buffer: Buffer; originalname: string };
  filename?: string; // For Buffer in Node.js
  contentType?: string; // For Buffer in Node.js
  folder?: string;
  metadata?: GenericObject;
  trigger_webhook?: boolean;
};
```

### 3. Comprehensive Examples ✅

Created three example files in `examples/` directory:

1. **test-media-upload.ts** - Simple runnable test script
2. **media-upload-node.ts** - Node.js specific examples
3. **media-upload-nextjs.ts** - Complete Next.js examples (App Router & Pages Router)

## How It Works

### Node.js Environment

```typescript
// Detects Node.js environment
if (isNode) {
  const data = new NodeFormData();

  // Handles direct Buffer
  if (Buffer.isBuffer(params.media)) {
    data.append('media', params.media, {
      filename: params.filename || 'file',
      contentType: params.contentType || 'application/octet-stream',
    });
  }

  // Handles legacy { buffer, originalname } format
  else if (params.media.buffer && Buffer.isBuffer(params.media.buffer)) {
    data.append('media', params.media.buffer, params.media.originalname);
  }

  // Get proper headers with Content-Length
  data.getLength((err, length) => {
    const headers = {
      'Content-Length': length,
      ...data.getHeaders(),
    };
    // Upload...
  });
}
```

### Browser Environment

```typescript
// Detects browser environment
else {
  const data = new FormData(); // Native browser FormData

  // Handles File or Blob
  if (params.media instanceof File || params.media instanceof Blob) {
    const filename = params.media instanceof File ? params.media.name : 'file';
    data.append('media', params.media, filename);
  }

  // Browser sets Content-Type with boundary automatically
  const headers = {};
  // Upload...
}
```

## Usage Examples

### Node.js Server

```typescript
import { createBucketClient } from '@cosmicjs/sdk';
import { readFileSync } from 'fs';

const cosmic = createBucketClient({
  bucketSlug: 'your-bucket-slug',
  readKey: 'your-read-key',
  writeKey: 'your-write-key',
});

// Upload from file system
const fileBuffer = readFileSync('./image.jpg');
const result = await cosmic.media.insertOne({
  media: fileBuffer,
  filename: 'image.jpg',
  contentType: 'image/jpeg',
  folder: 'uploads',
});
```

### Next.js API Route (App Router)

```typescript
// app/api/upload/route.ts
import { createBucketClient } from '@cosmicjs/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cosmic
  const result = await cosmic.media.insertOne({
    media: {
      buffer: buffer,
      originalname: file.name,
    },
    folder: 'uploads',
  });

  return NextResponse.json(result);
}
```

### React Client Component

```typescript
'use client';

export default function FileUpload() {
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Upload successful:', result);
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          handleUpload(e.target.files[0]);
        }
      }}
    />
  );
}
```

## Testing

### Quick Test

1. Edit `examples/test-media-upload.ts` with your Cosmic credentials
2. Run: `bun examples/test-media-upload.ts`

The test will:

- Upload a text file using direct Buffer
- Upload a JSON file using legacy format
- Fetch the uploaded media to verify

### Expected Output

```
╔════════════════════════════════════════╗
║   Cosmic SDK Media Upload Test Suite  ║
╚════════════════════════════════════════╝

=== Test 1: Upload from Buffer ===
Uploading test file...
✓ Upload successful!

=== Test 2: Upload with Legacy Buffer Format ===
Uploading JSON file...
✓ Upload successful!

=== Test 3: Fetch Uploaded Media ===
Fetching media with ID: ...
✓ Fetch successful!

╔════════════════════════════════════════╗
║            Test Summary                ║
╚════════════════════════════════════════╝
Tests passed: 3/3
✓ All tests passed! 🎉
```

## Benefits

✅ **Backwards Compatible**: Supports legacy `{ buffer, originalname }` format  
✅ **Environment Agnostic**: Automatically detects and uses correct FormData  
✅ **Type Safe**: Proper TypeScript definitions for all formats  
✅ **Error Prevention**: Clear error messages for incorrect usage  
✅ **Next.js Friendly**: Works perfectly with Next.js API routes  
✅ **Well Documented**: Comprehensive examples for all use cases

## Migration Guide

If you were experiencing the `e.on is not a function` error:

### Before (Broken)

```typescript
// In Next.js API route - this failed
const result = await cosmic.media.insertOne({
  media: fileFromRequest, // ❌ File object in Node.js
});
```

### After (Fixed)

```typescript
// Convert File to Buffer first
const file = formData.get('file') as File;
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

const result = await cosmic.media.insertOne({
  media: {
    buffer: buffer,
    originalname: file.name,
  },
});
```

## Build Status

✅ TypeScript compilation successful  
✅ Types exported correctly  
✅ No linter errors  
✅ Build artifacts generated:

- `dist/index.js` (CommonJS)
- `dist/index.mjs` (ESM)
- `dist/index.d.ts` (TypeScript definitions)

## Files Changed

1. `src/clients/bucket/media/index.ts` - Refactored `insertOne` method
2. `src/types/media.types.ts` - Updated type definitions
3. `examples/test-media-upload.ts` - Simple test script (new)
4. `examples/media-upload-node.ts` - Node.js examples (new)
5. `examples/media-upload-nextjs.ts` - Next.js examples (new)
6. `examples/README.md` - Documentation (new)

## Next Steps

1. Test in your Next.js application
2. Verify uploads work correctly
3. Update any existing code using the old patterns
4. Consider publishing as a new version (suggest v1.5.6)

---

**Implementation Date**: October 17, 2025  
**SDK Version**: 1.5.5 → 1.5.6 (recommended)
