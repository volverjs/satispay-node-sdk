import { Api, Payment } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: List all payments
 * 
 * This example shows how to retrieve a list of payments with optional filters.
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

        console.log('Fetching payments...');

        // Get all payments with optional filters
        const result = await Payment.all({
            limit: 10,
            // status: 'ACCEPTED', // Optional: filter by status
            // from_date: '2024-01-01', // Optional: filter by date
            // starting_after_timestamp: new Date('2024-01-01'), // Optional: filter by timestamp using Date object
        });

        console.log(`Found ${result.data.length} payments`);
        console.log('Has more:', result.has_more);
        console.log('\nPayments:');
        result.data.forEach((payment, index) => {
            console.log(`\n${index + 1}. Payment ${payment.id}`);
            console.log(`   Status: ${payment.status}`);
            console.log(`   Amount: ${payment.amount_unit / 100} ${payment.currency}`);
            console.log(`   Code: ${payment.code_identifier}`);
        });
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
