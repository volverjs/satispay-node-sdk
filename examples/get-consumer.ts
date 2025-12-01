import { Api, Consumer } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Get consumer information
 * 
 * This example shows how to retrieve consumer information by phone number.
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

        // Replace with an actual phone number (format: +39xxxxxxxxxx)
        const phoneNumber = '+393331234567';

        console.log(`Fetching consumer ${phoneNumber}...`);

        const consumer = await Consumer.get(phoneNumber);

        console.log('Consumer details:');
        console.log(JSON.stringify(consumer, null, 2));
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
