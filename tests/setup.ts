import { beforeAll } from 'vitest'
import { Api } from '../src/Api'
import { config } from 'dotenv'

// Load environment variables from .env.local (if exists)
// dotenv automatically converts \n to real newlines
config({ path: '.env.local', override: true, quiet: true })

/**
 * Setup for E2E tests
 * Loads environment variables needed for integration tests
 * 
 * NOTE: E2E tests require pre-configured keys and run ONLY in staging environment
 */
beforeAll(() => {
	// Check that environment variables are available for E2E tests
	const hasE2EConfig =
		process.env.SATISPAY_PUBLIC_KEY &&
		process.env.SATISPAY_PRIVATE_KEY &&
		process.env.SATISPAY_KEY_ID

	if (hasE2EConfig) {
		// Force staging environment for safety
		Api.setEnv('staging')

		// Configure keys if available
		if (process.env.SATISPAY_PUBLIC_KEY) {
			Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY)
		}

		if (process.env.SATISPAY_PRIVATE_KEY) {
			Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY)
		}

		if (process.env.SATISPAY_KEY_ID) {
			Api.setKeyId(process.env.SATISPAY_KEY_ID)
		}

        return
	} 

	console.log('⚠ E2E configuration not found, E2E tests will be skipped')
})

/**
 * Helper to check if E2E tests can be executed
 * Requires all three keys to be configured
 */
export function canRunE2ETests(): boolean {
	return !!(
		process.env.SATISPAY_PUBLIC_KEY &&
		process.env.SATISPAY_PRIVATE_KEY &&
		process.env.SATISPAY_KEY_ID
	)
}

/**
 * Helper to check if keys are configured
 * (Alias of canRunE2ETests for backwards compatibility)
 */
export function hasAuthenticationKeys(): boolean {
	return canRunE2ETests()
}
