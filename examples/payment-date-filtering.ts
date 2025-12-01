import { Api, Payment } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Filter payments by date
 * 
 * This example demonstrates how to filter payments using Date objects
 * with the starting_after_timestamp parameter.
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

        console.log('Filtering payments by date...\n');

        // Example 1: Payments from yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        console.log('1. Payments from yesterday:');
        console.log(`   Filter date: ${yesterday.toISOString()}`);
        
        const paymentsFromYesterday = await Payment.all({
            starting_after_timestamp: yesterday, // Date object is automatically converted
            limit: 10,
        });

        console.log(`   Found ${paymentsFromYesterday.data.length} payments`);
        console.log(`   Has more: ${paymentsFromYesterday.has_more}\n`);

        // Example 2: Payments from last week
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        console.log('2. Payments from last week:');
        console.log(`   Filter date: ${lastWeek.toISOString()}`);
        
        const paymentsFromLastWeek = await Payment.all({
            starting_after_timestamp: lastWeek,
            limit: 20,
        });

        console.log(`   Found ${paymentsFromLastWeek.data.length} payments`);
        console.log(`   Has more: ${paymentsFromLastWeek.has_more}\n`);

        // Example 3: Payments from a specific date
        const specificDate = new Date('2024-01-01T00:00:00Z');
        
        console.log('3. Payments from a specific date:');
        console.log(`   Filter date: ${specificDate.toISOString()}`);
        
        const paymentsFromDate = await Payment.all({
            starting_after_timestamp: specificDate,
            limit: 5,
        });

        console.log(`   Found ${paymentsFromDate.data.length} payments`);
        console.log(`   Has more: ${paymentsFromDate.has_more}\n`);

        // Example 4: You can still use timestamp strings if needed
        const timestampString = new Date('2024-06-01').getTime().toString();
        
        console.log('4. Using timestamp string:');
        console.log(`   Timestamp: ${timestampString}`);
        
        const paymentsWithString = await Payment.all({
            starting_after_timestamp: timestampString,
            limit: 10,
        });

        console.log(`   Found ${paymentsWithString.data.length} payments`);
        console.log(`   Has more: ${paymentsWithString.has_more}\n`);

        // Example 5: Combine with other filters
        console.log('5. Date filter with status filter:');
        
        const combinedFilters = await Payment.all({
            starting_after_timestamp: yesterday,
            status: 'ACCEPTED',
            limit: 10,
        });

        console.log(`   Found ${combinedFilters.data.length} accepted payments from yesterday`);
        console.log(`   Has more: ${combinedFilters.has_more}`);

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
