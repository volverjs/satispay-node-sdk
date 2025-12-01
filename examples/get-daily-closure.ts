import { Api, DailyClosure } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Get daily closure
 * 
 * This example shows how to retrieve daily closure information.
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

        // Get today's daily closure (or specify a date like '20240115')
        console.log('Fetching daily closure...');

        const closure = await DailyClosure.get();

        console.log('Daily closure:');
        console.log(`Date: ${closure.date}`);
        console.log(`Total amount: ${closure.total_amount_unit / 100} ${closure.currency}`);
        console.log(`Payments count: ${closure.payments_count}`);
        console.log('\nFull closure object:');
        console.log(JSON.stringify(closure, null, 2));
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
