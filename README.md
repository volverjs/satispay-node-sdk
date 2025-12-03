# (Unofficial) Satispay GBusiness Node.js API SDK

[![npm version](https://img.shields.io/npm/v/@volverjs/satispay-node-sdk.svg)](https://www.npmjs.com/package/@volverjs/satispay-node-sdk)
[![codecov](https://codecov.io/gh/volverjs/satispay-node-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/volverjs/satispay-node-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/@volverjs/satispay-node-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Universal (but unofficial) TypeScript SDK for Satispay GBusiness API integration. Zero external dependencies, compatible with Node.js, Deno, and Bun.

## Features

- **Zero dependencies** - Uses only native standard APIs (fetch, crypto)
- **Multi-runtime** - Works with Node.js 18+, Deno 1.30+, and Bun 1.0+
- **Lightweight** - Only 268KB bundle size
- **Type-safe** - Complete TypeScript definitions
- **Modern** - Fetch API, async/await, ES Modules
- **Secure** - Native RSA-SHA256 encryption
- **Developer-friendly** - Intuitive API with automatic conversions:
  - 💶 Use `amount` (euros) instead of `amount_unit` (cents)
  - 📅 Use `Date` objects instead of timestamp strings

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

## API Reference

### Payment Operations

#### Create Payment

```typescript
// Using amount in euros (recommended)
const payment = await Payment.create({
  flow: 'MATCH_CODE',
  amount: 1.00, // Automatically converted to 100 cents
  currency: 'EUR',
  callback_url: 'https://your-site.com/callback',
  external_code: 'ORDER-123',
  metadata: { order_id: '12345' },
});

// Or using amount_unit in cents (still supported)
const payment2 = await Payment.create({
  flow: 'MATCH_CODE',
  amount_unit: 100, // Amount in cents
  currency: 'EUR',
  callback_url: 'https://your-site.com/callback',
  external_code: 'ORDER-123',
  metadata: { order_id: '12345' },
});
```

**💡 Tip**: Use `amount` (euros) for more intuitive code. The SDK automatically converts it to cents.

See [examples/create-payment-with-amount.ts](./examples/create-payment-with-amount.ts) for more examples.

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

result.data.forEach(payment => {
  console.log(`${payment.id}: ${payment.status}`);
});
```

##### Filter by Date

You can filter payments using `Date` objects or timestamp strings:

```typescript
// Using Date objects (recommended)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const recentPayments = await Payment.all({
  starting_after_timestamp: yesterday, // Date is automatically converted to milliseconds
  limit: 10,
});

// Or using timestamp string (milliseconds)
const timestampString = new Date('2024-01-01').getTime().toString();
const paymentsFromDate = await Payment.all({
  starting_after_timestamp: timestampString,
  limit: 10,
});
```

See [examples/payment-date-filtering.ts](./examples/payment-date-filtering.ts) for more examples.

#### Update Payment

```typescript
// Using amount in euros
const payment = await Payment.update('PAYMENT_ID', {
  action: 'ACCEPT',
  amount: 5.50, // Automatically converted to 550 cents
});

// Or using amount_unit in cents
const payment2 = await Payment.update('PAYMENT_ID', {
  action: 'ACCEPT',
  amount_unit: 550,
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

// Specific date using Date object (recommended)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const closureByDate = await DailyClosure.get(yesterday);

// Or using YYYYMMDD string format
const closureByString = await DailyClosure.get('20240115');

console.log('Date:', closure.shop_daily_closure.id);
console.log('Total:', closure.shop_daily_closure.amount_unit / 100, closure.shop_daily_closure.currency);
console.log('Gross:', closure.shop_daily_closure.gross_amount_unit / 100);
console.log('Refunds:', closure.shop_daily_closure.refund_amount_unit / 100);
```

### Pre-Authorized Payment Tokens

Pre-Authorized Payment Tokens allow consumers to authorize payments in advance:

```typescript
import { PreAuthorizedPaymentToken } from '@volverjs/satispay-node-sdk';

// Create a pre-authorized payment token
const token = await PreAuthorizedPaymentToken.create({
  reason: 'Subscription payment',
  callback_url: 'https://your-site.com/callback',
  redirect_url: 'https://your-site.com/success',
});

console.log('Token ID:', token.id);
console.log('Token:', token.token);
console.log('Status:', token.status); // PENDING

// Get token details
const retrievedToken = await PreAuthorizedPaymentToken.get(token.id);

// Update token (e.g., cancel it)
const updatedToken = await PreAuthorizedPaymentToken.update(token.id, {
  status: 'CANCELED',
});

// Once the consumer accepts the token, you can use it to create payments:
const payment = await Payment.create({
  flow: 'PRE_AUTHORIZED',
  token: token.token,
  amount: 9.99,
  currency: 'EUR',
});
```

**Important Notes:**
- The consumer must accept the token before it can be used for payments
- Token status can be: `PENDING`, `ACCEPTED`, or `CANCELED`
- Use the `token` field (not the `id`) when creating pre-authorized payments

### Reports

> **⚠️ Special Authentication Required**: Report APIs require special authentication keys. Contact tech@satispay.com to enable access.

```typescript
import { Report } from '@volverjs/satispay-node-sdk';

// Create a new report
const report = await Report.create({
  type: 'PAYMENT_FEE',
  format: 'CSV', // or 'PDF', 'XLSX'
  from_date: '2025-11-01',
  to_date: '2025-11-30',
  columns: ['transaction_id', 'transaction_date', 'total_amount'], // Optional
});

// Get list of reports
const reports = await Report.all({
  limit: 10,
  starting_after: 'report-123',
});

// Get specific report
const reportDetails = await Report.get('report-123');

if (reportDetails.status === 'READY' && reportDetails.download_url) {
  console.log('Download URL:', reportDetails.download_url);
}
```

**Important Notes:**
- Reports are extracted at merchant level (includes all shops)
- Reports for the previous day should be generated at least 4 hours after midnight
- Report status: `PENDING`, `READY`, or `FAILED`

### Sessions (POS Integration)

Sessions are used for POS/device integration to manage fund lock payments incrementally:

```typescript
import { Session } from '@volverjs/satispay-node-sdk';

// Open a session from a fund lock
const session = await Session.open({
  fund_lock_id: 'payment-fund-lock-123',
});

console.log('Session ID:', session.id);
console.log('Available amount:', session.residual_amount_unit);

// Add items to the session
await Session.createEvent(session.id, {
  operation: 'ADD',
  amount_unit: 500,
  currency: 'EUR',
  description: 'Coffee',
  metadata: { sku: 'COFFEE-001' },
});

// Remove items (e.g., discount)
await Session.createEvent(session.id, {
  operation: 'REMOVE',
  amount_unit: 200,
  currency: 'EUR',
  description: 'Discount',
});

// Get session details
const details = await Session.get(session.id);
console.log('Residual amount:', details.residual_amount_unit);

// Close the session
const closedSession = await Session.update(session.id, {
  status: 'CLOSE',
});
```

### Meal Voucher & Fringe Benefits

Meal Voucher and Fringe Benefits payments use the same `Payment` API with additional parameters:

```typescript
import { Payment } from '@volverjs/satispay-node-sdk';

// Create payment with Meal Voucher limits
const payment = await Payment.create({
  flow: 'MATCH_CODE',
  amount: 50.00,
  currency: 'EUR',
  meal_voucher_max_amount_unit: 4000, // Max 40 EUR with meal vouchers
  meal_voucher_max_quantity: 8, // Max 8 vouchers
});

// Update payment with Meal Voucher limits
const updated = await Payment.update(payment.id, {
  action: 'ACCEPT',
  meal_voucher_max_amount_unit: 3000,
  meal_voucher_max_quantity: 6,
});
```

**Important Notes:**
- Meal Vouchers and Fringe Benefits are mutually exclusive
- Meal Voucher refunds: Only on the same day, full amount only
- Fringe Benefits refunds: Only within the same month, full amount only
- Default limit: 8 meal vouchers per payment if not specified

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

Current test coverage: **94.82%** (Statements: 93.83%, Branches: 89.65%, Functions: 100%, Lines: 95.8%)

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
- Minimal bundle size (268KB)
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
