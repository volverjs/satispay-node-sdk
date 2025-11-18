import { Api } from '../src';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example: Authenticate with token
 * 
 * This example shows how to authenticate with Satispay using an activation token.
 * The token can be generated from your Satispay Business Dashboard.
 */

async function main() {
    try {
        // Enable sandbox mode
        Api.setSandbox(true);

        // Replace with your activation token
        const token = 'YOUR_ACTIVATION_TOKEN';

        console.log('Authenticating with token...');
        const authentication = await Api.authenticateWithToken(token);

        console.log('Authentication successful!');
        console.log('Key ID:', authentication.keyId);

        // Save keys to file for later use
        const authData = {
            public_key: authentication.publicKey,
            private_key: authentication.privateKey,
            key_id: authentication.keyId,
        };

        const authFilePath = path.join(__dirname, 'authentication.json');
        fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));

        console.log('Keys saved to:', authFilePath);
        console.log('\nIMPORTANT: Store these keys securely! Never commit them to version control.');
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main();
