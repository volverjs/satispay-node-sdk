# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive test suite with 66 tests and 72% coverage
- GitHub Actions CI/CD workflows for automated testing and npm publishing
- Vitest test framework with UI and coverage reporting
- Support for multiple runtimes: Node.js 18+, Deno 1.30+, Bun 1.0+

### Changed
- Migrated build system from TypeScript compiler to Vite
- Improved TypeScript declaration generation with vite-plugin-dts
- Tests moved to dedicated `tests/` folder for better organization

### Fixed
- TypeScript declaration files output to correct location in dist/

## [0.0.1] - TBD

### Added
- Initial implementation of Satispay GBusiness Node.js SDK
- Api class for configuration and environment management
- ApiAuthentication for token-based authentication
- Payment operations (create, get, list, update)
- Consumer operations (get consumer details)
- DailyClosure operations (get daily closure reports)
- PreAuthorizedPaymentToken operations (create, get, list, accept, reject)
- Request class for HTTP operations with automatic signing
- RSA service for key generation and cryptographic operations
- Support for both Node.js crypto and Web Crypto API
- CLI tool `satispay-keygen` for generating RSA key pairs
- Comprehensive examples for common operations
- Zero runtime dependencies

### API Methods

#### Authentication
- `Api.authenticateWithToken(token: string)` - Generate keys and authenticate

#### Configuration
- `Api.setEnv(env: Environment)` - Set environment (staging/production)
- `Api.setKeys(keyId: string, privateKey: string)` - Set authentication keys
- `Api.setPlatformHeader(value: string)` - Set platform identification header

#### Payment Operations
- `Payment.create(options)` - Create a new payment
- `Payment.get(id: string)` - Get payment details
- `Payment.list(options)` - List payments with filters
- `Payment.update(id: string, options)` - Update payment metadata

#### Consumer Operations
- `Consumer.get(id: string)` - Get consumer details

#### Daily Closure Operations
- `DailyClosure.get(date: Date)` - Get daily closure report

#### Pre-Authorized Payment Tokens
- `PreAuthorizedPaymentToken.create(options)` - Create token
- `PreAuthorizedPaymentToken.get(token: string)` - Get token details
- `PreAuthorizedPaymentToken.list()` - List tokens
- `PreAuthorizedPaymentToken.accept(token: string)` - Accept token
- `PreAuthorizedPaymentToken.reject(token: string)` - Reject token

[Unreleased]: https://github.com/volverjs/satispay-node-sdk/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/volverjs/satispay-node-sdk/releases/tag/v0.0.1
