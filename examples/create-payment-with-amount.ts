import { Api, Payment } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Create payment using amount in euros
 * 
 * This example demonstrates how to create payments using the 'amount' field
 * which accepts floating-point numbers in euros instead of cents.
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

        console.log('Creating payments using amount field...\n');

        // Example 1: Simple payment with amount in euros
        console.log('1. Creating payment with 10.50 EUR:');
        const payment1 = await Payment.create({
            flow: 'MATCH_CODE',
            amount: 10.50, // Automatically converted to 1050 cents
            currency: 'EUR',
            external_code: `EXAMPLE-${Date.now()}-1`,
        });

        console.log(`   Payment ID: ${payment1.id}`);
        console.log(`   Code: ${payment1.code_identifier}`);
        console.log(`   Amount: ${payment1.amount_unit / 100} EUR (${payment1.amount_unit} cents)`);
        console.log(`   Status: ${payment1.status}\n`);

        // Example 2: Payment with decimal precision
        console.log('2. Creating payment with 99.99 EUR:');
        const payment2 = await Payment.create({
            flow: 'MATCH_CODE',
            amount: 99.99, // Handles decimal precision correctly
            currency: 'EUR',
            external_code: `EXAMPLE-${Date.now()}-2`,
            metadata: {
                description: 'Premium product',
                category: 'electronics',
            },
        });

        console.log(`   Payment ID: ${payment2.id}`);
        console.log(`   Code: ${payment2.code_identifier}`);
        console.log(`   Amount: ${payment2.amount_unit / 100} EUR (${payment2.amount_unit} cents)`);
        console.log(`   Status: ${payment2.status}\n`);

        // Example 3: Small amount (0.50 EUR)
        console.log('3. Creating payment with 0.50 EUR:');
        const payment3 = await Payment.create({
            flow: 'MATCH_CODE',
            amount: 0.50, // 50 cents
            currency: 'EUR',
            external_code: `EXAMPLE-${Date.now()}-3`,
        });

        console.log(`   Payment ID: ${payment3.id}`);
        console.log(`   Code: ${payment3.code_identifier}`);
        console.log(`   Amount: ${payment3.amount_unit / 100} EUR (${payment3.amount_unit} cents)`);
        console.log(`   Status: ${payment3.status}\n`);

        // Example 4: Comparing with amount_unit (old way)
        console.log('4. Using amount_unit (cents) - still supported:');
        const payment4 = await Payment.create({
            flow: 'MATCH_CODE',
            amount_unit: 2500, // 25.00 EUR in cents
            currency: 'EUR',
            external_code: `EXAMPLE-${Date.now()}-4`,
        });

        console.log(`   Payment ID: ${payment4.id}`);
        console.log(`   Code: ${payment4.code_identifier}`);
        console.log(`   Amount: ${payment4.amount_unit / 100} EUR (${payment4.amount_unit} cents)`);
        console.log(`   Status: ${payment4.status}\n`);

        console.log('✓ All payments created successfully!');
        console.log('\n💡 Tip: Using "amount" (euros) is more intuitive than "amount_unit" (cents)');

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
