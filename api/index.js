// Plain JS on purpose: NestJS relies on TypeScript's `emitDecoratorMetadata` for dependency
// injection, which Vercel's default esbuild-based TS handling for function entry files does
// NOT support (DI silently breaks). Pre-compiling with real `tsc` (see package.json
// `vercel-build`) and requiring the compiled output here sidesteps that entirely — this file
// itself needs no TS transform, so Vercel just ships it as-is.
module.exports = require('../dist/serverless.js').default;
