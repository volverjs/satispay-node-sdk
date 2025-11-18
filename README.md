# (Unofficial) Satispay GBusiness Node.js API SDK

[![npm version](https://img.shields.io/npm/v/@volverjs/satispay-node-sdk.svg)](https://www.npmjs.com/package/@volverjs/satispay-node-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@volverjs/satispay-node-sdk.svg)](https://www.npmjs.com/package/@volverjs/satispay-node-sdk)
[![CI](https://github.com/volverjs/satispay-node-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/volverjs/satispay-node-sdk/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/volverjs/satispay-node-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/volverjs/satispay-node-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/@volverjs/satispay-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Universal (but unofficial) TypeScript SDK for Satispay GBusiness API integration. Zero external dependencies, compatible with Node.js, Deno, and Bun.

## Features

- **Zero dependencies** - Uses only native standard APIs (fetch, crypto)
- **Multi-runtime** - Works with Node.js 18+, Deno 1.30+, and Bun 1.0+
- **Lightweight** - Only 156KB bundle size
- **Type-safe** - Complete TypeScript definitions
- **Modern** - Fetch API, async/await, ES Modules
- **Secure** - Native RSA-SHA256 encryption

## Installation

### Node.js

```bash
npm install @volverjs/satispay-node-sdk
```

### Deno

```typescript
import { Api, Payment } from "npm:@volverjs/satispay-node-sdk";
```

Or use `deno.json`:

```json
{
  "imports": {
    "satispay": "npm:@volverjs/satispay-node-sdk"
  }
}
```

### Bun

```bash
bun add @volverjs/satispay-node-sdk
```

## Quick Start

### Authentication

Get your credentials using the CLI tool with an activation token:

```bash
npx @volverjs/satispay-node-sdk YOUR_ACTIVATION_TOKEN
```

This will generate:
- **Public Key** - RSA public key
- **Private Key** - RSA private key (keep this secure!)
- **Key ID** - Your authentication key ID

**Where to get the activation token:**
- **Production**: [Satispay Business Dashboard](https://business.satispay.com) → Developers → Generate Activation Code
- **Sandbox**: Request from [Satispay Developer Support](https://developers.satispay.com/docs/credentials#sandbox-account)

**Options:**
```bash
npx @volverjs/satispay-node-sdk YOUR_TOKEN              # Sandbox (default)
npx @volverjs/satispay-node-sdk YOUR_TOKEN --production # Production
npx @volverjs/satispay-node-sdk YOUR_TOKEN --sandbox    # Sandbox (explicit)
```

> **⚠️ Important**: The activation token is single-use. Save the generated credentials securely!

### Configure the SDK

Use the generated credentials to configure the SDK:

```typescript
import { Api } from '@volverjs/satispay-node-sdk';

Api.setSandbox(true); // or false for production
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY!);
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY!);
Api.setKeyId(process.env.SATISPAY_KEY_ID!);
```

Store credentials in `.env`:
```bash
SATISPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
SATISPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
SATISPAY_KEY_ID="your-key-id"
```

### Create a Payment

```typescript
import { Payment } from '@volverjs/satispay-node-sdk';

const payment = await Payment.create({
  flow: 'MATCH_CODE',
  amount_unit: 199, // Amount in cents (1.99 EUR)
  currency: 'EUR',
});

console.log('Payment ID:', payment.id);
console.log('Code:', payment.code_identifier);
```

## API Reference

### Payment Operations

#### Create Payment

```typescript
const payment = await Payment.create({
  flow: 'MATCH_CODE',
  amount_unit: 100,
  currency: 'EUR',
  callback_url: 'https://your-site.com/callback',
  external_code: 'ORDER-123',
  metadata: { order_id: '12345' },
});
```

#### Get Payment

```typescript
const payment = await Payment.get('PAYMENT_ID');
console.log('Status:', payment.status);
```

#### List Payments

```typescript
const result = await Payment.all({
  limit: 20,
  status: 'ACCEPTED',
  from_date: '2024-01-01',
});

result.list.forEach(payment => {
  console.log(`${payment.id}: ${payment.status}`);
});
```

#### Update Payment

```typescript
const payment = await Payment.update('PAYMENT_ID', {
  metadata: { order_id: '67890' },
});
```

### Consumer Operations

```typescript
import { Consumer } from '@volverjs/satispay-node-sdk';

const consumer = await Consumer.get('+393331234567');
console.log('Consumer:', consumer.name);
```

### Daily Closure

```typescript
import { DailyClosure } from '@volverjs/satispay-node-sdk';

// Today's closure
const closure = await DailyClosure.get();

// Specific date (YYYYMMDD format)
const closureByDate = await DailyClosure.get('20240115');

console.log('Date:', closure.date);
console.log('Total:', closure.total_amount_unit / 100, closure.currency);
console.log('Payments:', closure.payments_count);
```

### Pre-Authorized Payment Tokens

```typescript
import { PreAuthorizedPaymentToken } from '@volverjs/satispay-node-sdk';

// Create token
const token = await PreAuthorizedPaymentToken.create({
  flow: 'MATCH_CODE',
  consumer_uid: 'CONSUMER_UID',
});

// Get token
const retrievedToken = await PreAuthorizedPaymentToken.get(token.id);

// Update token
const updatedToken = await PreAuthorizedPaymentToken.update(token.id, {
  status: 'CANCELED',
});
```

## Runtime-Specific Examples

### Node.js Server

```typescript
import express from 'express';
import { Api, Payment } from '@volverjs/satispay-node-sdk';

Api.setSandbox(true);
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY);
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY);
Api.setKeyId(process.env.SATISPAY_KEY_ID);

const app = express();
app.use(express.json());

app.post('/create-payment', async (req, res) => {
  const payment = await Payment.create({
    flow: 'MATCH_CODE',
    amount_unit: req.body.amount,
    currency: 'EUR',
  });
  res.json(payment);
});

app.listen(3000);
```

### Deno Server

```typescript
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { Api, Payment } from "npm:@volverjs/satispay-node-sdk";

Api.setSandbox(true);
Api.setPublicKey(Deno.env.get("SATISPAY_PUBLIC_KEY")!);
Api.setPrivateKey(Deno.env.get("SATISPAY_PRIVATE_KEY")!);
Api.setKeyId(Deno.env.get("SATISPAY_KEY_ID")!);

serve(async (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/create-payment" && req.method === "POST") {
    const body = await req.json();
    const payment = await Payment.create({
      flow: "MATCH_CODE",
      amount_unit: body.amount,
      currency: "EUR",
    });
    return Response.json(payment);
  }
  
  return Response.json({ error: "Not found" }, { status: 404 });
});
```

### Bun Server

```typescript
import { Api, Payment } from "@volverjs/satispay-node-sdk";

Api.setSandbox(true);
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY!);
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY!);
Api.setKeyId(process.env.SATISPAY_KEY_ID!);

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/create-payment" && req.method === "POST") {
      const body = await req.json();
      const payment = await Payment.create({
        flow: "MATCH_CODE",
        amount_unit: body.amount,
        currency: "EUR",
      });
      return Response.json(payment);
    }
    
    return Response.json({ error: "Not found" }, { status: 404 });
  },
});
```

## Custom Headers

```typescript
import { Api, Request } from '@volverjs/satispay-node-sdk';

// Global headers
Api.setPlatformHeader('MyApp');
Api.setPlatformVersionHeader('1.0.0');
Api.setPluginNameHeader('my-plugin');
Api.setPluginVersionHeader('2.0.0');
Api.setTypeHeader('ONLINE_SHOP');
Api.setTrackingHeader('tracking-code-123');

// Per-request headers
const payment = await Payment.create(
  {
    flow: 'MATCH_CODE',
    amount_unit: 100,
    currency: 'EUR',
  },
  {
    [Request.HEADER_TRACKING_CODE]: 'custom-tracking-code',
    [Request.HEADER_IDEMPOTENCY_KEY]: 'unique-key-123',
  }
);
```

## Environment Configuration

### Sandbox Mode

```typescript
Api.setSandbox(true); // Test environment
Api.setSandbox(false); // Production environment
```

### Environment Variables

Store your credentials securely:

```bash
# .env
SATISPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
SATISPAY_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
SATISPAY_KEY_ID="your-key-id"
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm build:watch

# Run tests
pnpm test

# Watch tests
pnpm test:watch

# Test with UI
pnpm test:ui

# Coverage report
pnpm test:coverage

# Lint
pnpm lint

# Format
pnpm format
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. The test suite includes:

- **Unit tests** for all core modules (Api, Payment, Consumer, DailyClosure, etc.)
- **RSA Service tests** for cryptographic operations
- **Mock-based tests** for API interactions

Current test coverage: **79.45%**

Run tests:
```bash
pnpm test              # Run all tests
pnpm test:watch        # Watch mode for development
pnpm test:ui           # Interactive UI
pnpm test:coverage     # Generate coverage report
```

## Examples

See the [`examples/`](./examples) directory for complete examples:

- `auth-with-token.ts` - Authentication with token
- `create-payment.ts` - Create a payment
- `get-payment.ts` - Get payment details
- `get-payments.ts` - List payments
- `get-consumer.ts` - Get consumer information
- `get-daily-closure.ts` - Get daily closure

To run examples:

```bash
npm install
npm run build
cd examples
npx tsc
node dist/auth-with-token.js
```

## Requirements

| Runtime | Minimum Version | Native fetch Support |
|---------|----------------|---------------------|
| Node.js | 18.0.0 | Yes |
| Deno | 1.30.0 | Yes |
| Bun | 1.0.0 | Yes |

No external dependencies required.

## Technical Details

This SDK uses Web Standard APIs:

- **fetch API** for HTTP requests (native in all supported runtimes)
- **crypto module** for RSA-SHA256 signatures (Node.js crypto with compatibility layers for Deno/Bun)

Benefits:
- Same code works across all runtimes
- No polyfills needed
- Native performance
- Future-proof

## Why Zero Dependencies?

- No third-party vulnerability risks
- Minimal bundle size (156KB)
- Fast installation
- No dependency conflicts
- Uses only standard APIs

## Error Handling

```typescript
try {
  const payment = await Payment.create({
    flow: 'MATCH_CODE',
    amount_unit: 100,
    currency: 'EUR',
  });
} catch (error) {
  console.error('Payment creation failed:', error.message);
}
```

## TypeScript Support

Full TypeScript support with complete type definitions included:

```typescript
import type {
  PaymentCreate,
  PaymentResponse,
  ConsumerResponse,
  DailyClosureResponse,
} from '@volverjs/satispay-node-sdk';
```

## License

MIT

## Links

- [API Documentation](https://developers.satispay.com)
- [Business Dashboard](https://business.satispay.com)
- [Satispay Website](https://www.satispay.com)
