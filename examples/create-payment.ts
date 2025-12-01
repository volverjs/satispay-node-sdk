import { Api, Payment } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Create a payment
 * 
 * This example shows how to create a payment using the Satispay API.
 */

async function main() {
    try {
        // Enable sandbox mode
        Api.setSandbox(true);

        // Load authentication keys from file
        const authFilePath = path.join(__dirname, 'authentication.json');

        if (!fs.existsSync(authFilePath)) {
            console.error('Authentication file not found. Please run auth-with-token.ts first.');
            process.exit(1);
        }

        const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));

        // Set authentication keys
        Api.setPublicKey(authData.public_key);
        Api.setPrivateKey(authData.private_key);
        Api.setKeyId(authData.key_id);

        console.log('Creating payment...');

        // Create a payment using amount in euros (recommended)
        const payment = await Payment.create({
            flow: 'MATCH_CODE',
            amount: 1.99, // Amount in euros (automatically converted to cents)
            currency: 'EUR',
        });

        // Or using amount_unit in cents (still supported)
        // const payment = await Payment.create({
        //     flow: 'MATCH_CODE',
        //     amount_unit: 199, // Amount in cents (1.99 EUR)
        //     currency: 'EUR',
        // });

        console.log('Payment created successfully!');
        console.log('Payment ID:', payment.id);
        console.log('Payment Code:', payment.code_identifier);
        console.log('Amount:', payment.amount_unit / 100, 'EUR');
        console.log('Status:', payment.status);
        console.log('\nFull payment object:');
        console.log(JSON.stringify(payment, null, 2));
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
