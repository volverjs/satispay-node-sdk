# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.3] - 2025-12-03

### Changed
- **BREAKING:** `DailyClosure` type structure completely rewritten to match actual Satispay API response
  - Now returns `shop_daily_closure` and `device_daily_closure` objects
  - Each closure includes: `id`, `type`, `customer_uid`, `gross_amount_unit`, `refund_amount_unit`, `amount_unit`, `currency`
- **BREAKING:** Removed non-existent fields from `DailyClosure` type:
  - Removed `date` field (use `shop_daily_closure.id` instead)
  - Removed `total_amount_unit` field (use `shop_daily_closure.amount_unit` instead)
  - Removed `payments_count` field (not provided by Satispay API)
- `DailyClosure.get()` now accepts `Date` objects in addition to string dates (YYYYMMDD format)
- Updated documentation with correct API response structure and `Date` object usage examples

### Added
- `DailyClosureDetail` type for structured closure information
- `DateUtils.formatToYYYYMMDD()` utility function for date formatting
- Comprehensive E2E tests for daily closure functionality (5 test cases)
- Unit tests for `Date` object support in `DailyClosure.get()`
- Enhanced examples showing multiple ways to retrieve daily closures

### Fixed
- `DailyClosure` type now accurately reflects Satispay's actual API response
- Corrected documentation to match real API behavior verified through testing

## [0.0.2] - 2025-12-01

### Fixed
- add bin `satispay-keygen` to build configuration

## [0.0.1] - 2025-12-01

### Added
- Initial implementation of Satispay GBusiness Node.js SDK
- Zero runtime dependencies - uses only native APIs (fetch, crypto)
- Multi-runtime support: Node.js 18+, Deno 1.30+, Bun 1.0+
- Complete TypeScript definitions with full type safety

#### API Classes
- `Api` - Configuration and environment management
- `ApiAuthentication` - Token-based authentication and key generation
- `Payment` - Create, retrieve, list, and update payments (including meal vouchers and fringe benefits)
- `Consumer` - Retrieve consumer information
- `DailyClosure` - Get daily closure reports
- `PreAuthorizedPaymentToken` - Manage pre-authorized payment tokens
- `Report` - Generate and retrieve payment reports (CSV, PDF, XLSX)
- `Session` - POS integration for fund lock payments with incremental charging
- `Request` - HTTP operations with automatic RSA-SHA256 signing
- `RSAService` - Key generation and cryptographic operations

#### Tools & Testing
- CLI tool `satispay-keygen` for RSA key pair generation
- Comprehensive test suite with 163 tests using Vitest
- E2E tests for integration testing with staging environment
- GitHub Actions CI/CD workflows for automated testing and npm publishing
- Vite-based build system with optimized TypeScript declaration generation

#### Documentation & Examples
- Complete API documentation in README
- Example files for all major operations (payments, reports, sessions, webhooks, etc.)
- Runtime-specific examples for Node.js, Deno, and Bun

[0.0.3]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/volverjs/satispay-node-sdk/releases/tag/v0.0.1
