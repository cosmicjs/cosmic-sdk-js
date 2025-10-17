# @cosmicjs/sdk

## 1.5.6

### Patch Changes

- fix: Environment-aware media upload to resolve "e.on is not a function" error in Next.js
  - Fixes media uploads in Next.js API routes by properly detecting Node.js vs browser environments
  - Maintains full backwards compatibility with existing `{ buffer, originalname }` format
  - Adds support for direct Buffer uploads with optional `filename` and `contentType` parameters
  - Improved type safety with proper TypeScript definitions for media upload formats
  - See `docs/MEDIA_UPLOAD_FIX.md` for detailed implementation notes and migration examples

## 1.5.5

### Patch Changes

- 6c749a2: fix: browser fix for EventEmitter

## 1.5.2

### Patch Changes

- 874ccd9: fix: type issue for streaming response

## 1.5.1

### Patch Changes

- 4055f2d: edit: readme update

## 1.5.0

### Minor Changes

- fc44e2a: feat: Add real-time text streaming support for AI text generation

## 1.4.0

### Minor Changes

- 245eabc: Adds AI methods: generateText and generateImage

## 1.3.2

### Patch Changes

- d3e34f2: Add find and findOne object revision methods

## 1.3.1

### Patch Changes

- f8e940a: Added typescript type for add revision method

## 1.3.0

### Minor Changes

- ad65234: add insert objectRevision method

## 1.2.0

### Minor Changes

- 0042953: Adds: props graph syntax to Objects fetching, media data fetching option

## 1.0.11

### Patch Changes

- 3e1bb28: edit readme to use bun

## 1.0.10

### Patch Changes

- 41cc4d9: Add support for more characters in query

## 1.0.9

### Patch Changes

- FIX: Includes type fixes and promise logic updates for catching errors correctly

## 1.0.8

### Patch Changes

- 70d40fa: Added contributing section in Readme

## 1.0.7

### Patch Changes

- 914eb19: Edit Readme links

## 1.0.6

### Patch Changes

- e90ba95: fix pnpm typo in readme

## 1.0.5

### Patch Changes

- ebddb45: remove $set from readme example

## 1.0.4

### Patch Changes

- 2aea85b: update readme to include concise format for updateOne and deleteOne

## 1.0.3

### Patch Changes

- b5af5d8: Added validation for writeKey on package level.

## 1.0.2

### Patch Changes

- 66f489d: edit readme copy and link to dashboard

## 1.0.1

### Patch Changes

- 738a079: edit readme
- 4ddcab6: edit cms abbrevation

## 1.0.0

### Major Changes

- d381040: Added ESM support.
  Supports chain methods for media and objects.
