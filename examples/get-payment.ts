import { Api, Payment } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Get payment details
 * 
 * This example shows how to retrieve payment information by ID.
 */

async function main() {
    try {
        // Enable sandbox mode
        Api.setSandbox(true);

        // Load authentication keys
        const authFilePath = path.join(__dirname, 'authentication.json');
        const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));

        Api.setPublicKey(authData.public_key);
        Api.setPrivateKey(authData.private_key);
        Api.setKeyId(authData.key_id);

        // Replace with an actual payment ID
        const paymentId = 'YOUR_PAYMENT_ID';

        console.log(`Fetching payment ${paymentId}...`);

        const payment = await Payment.get(paymentId);

        console.log('Payment details:');
        console.log(JSON.stringify(payment, null, 2));
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
