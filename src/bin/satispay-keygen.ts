#!/usr/bin/env node

/**
 * Satispay Key Generator CLI
 * 
 * Usage:
 *   npx @volverjs/satispay-node-sdk <activation_token>
 *   
 * Options:
 *   --sandbox, -s    Use sandbox environment (default: true)
 *   --production, -p Use production environment
 *   --help, -h       Show help
 */

import { Api } from '../index.js';

const args = process.argv.slice(2);

// Show help
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
Satispay Key Generator

Generate RSA keys from an activation token.

Usage:
  npx @volverjs/satispay-node-sdk <activation_token> [options]

Options:
  --sandbox, -s     Use sandbox environment (default)
  --production, -p  Use production environment
  --help, -h        Show this help message

Example:
  npx @volverjs/satispay-node-sdk YOUR_TOKEN
  npx @volverjs/satispay-node-sdk YOUR_TOKEN --production

Output:
  The command will generate and display:
  - Public Key
  - Private Key
  - Key ID

  Store these credentials securely in your environment variables or configuration.
`);
    process.exit(0);
}

// Parse arguments
let token: string | undefined;
let useSandbox = true;

for (const arg of args) {
    if (arg === '--production' || arg === '-p') {
        useSandbox = false;
    } else if (arg === '--sandbox' || arg === '-s') {
        useSandbox = true;
    } else if (!arg.startsWith('-')) {
        token = arg;
    }
}

// Validate token
if (!token) {
    console.error('Error: Activation token is required\n');
    console.log('Usage: npx @volverjs/satispay-node-sdk <activation_token>');
    console.log('Run with --help for more information');
    process.exit(1);
}

// Generate keys
async function generateKeys() {
    try {
        console.log('\n🔑 Satispay Key Generator');
        console.log('========================\n');
        console.log(`Environment: ${useSandbox ? 'Sandbox (Test)' : 'Production'}`);
        console.log(`Token: ${token!.substring(0, 10)}...`);
        console.log('\nGenerating RSA keys...\n');

        Api.setSandbox(useSandbox);

        const authentication = await Api.authenticateWithToken(token!);

        console.log('✅ Keys generated successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 Public Key:');
        console.log(authentication.publicKey);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🔐 Private Key:');
        console.log(authentication.privateKey);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🆔 Key ID:');
        console.log(authentication.keyId);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('⚠️  IMPORTANT: Store these credentials securely!');
        console.log('   Never commit them to version control.\n');

        console.log('💡 Environment Variables (.env):');
        console.log(`
SATISPAY_PUBLIC_KEY="${authentication.publicKey.replace(/\n/g, '\\n')}"
SATISPAY_PRIVATE_KEY="${authentication.privateKey.replace(/\n/g, '\\n')}"
SATISPAY_KEY_ID="${authentication.keyId}"
`);

        console.log('📝 Usage in your code:');
        console.log(`
import { Api } from '@volverjs/satispay-node-sdk';

Api.setSandbox(${useSandbox});
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY!);
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY!);
Api.setKeyId(process.env.SATISPAY_KEY_ID!);
`);

    } catch (error: any) {
        console.error('\n❌ Error generating keys:\n');
        console.error(error.message);

        if (error.message.includes('401')) {
            console.error('\n💡 The activation token is invalid or has expired.');
            console.error('   Generate a new token from your Satispay Business Dashboard.');
        } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Network error. Please check your internet connection.');
        }

        console.error('\n');
        process.exit(1);
    }
}

generateKeys();
