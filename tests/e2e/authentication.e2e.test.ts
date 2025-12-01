import { describe, it, expect } from 'vitest'
import { Api } from '../../src/Api'
import { canRunE2ETests } from '../setup'

/**
 * E2E tests for Satispay authentication
 * 
 * These tests require:
 * - SATISPAY_PUBLIC_KEY, SATISPAY_PRIVATE_KEY, SATISPAY_KEY_ID configured
 * 
 * NOTE: The activation code is not tested because it can only be used once.
 * Keys must be manually generated before running E2E tests.
 * 
 * Tests run ONLY in staging environment for safety.
 */

describe.skipIf(!canRunE2ETests())('E2E: Authentication', () => {
	describe('Authentication with existing keys', () => {
		it(
			'should have valid authentication keys configured',
			() => {
				// Verify that keys are configured correctly
				const privateKey = Api.getPrivateKey()
				const publicKey = Api.getPublicKey()
				const keyId = Api.getKeyId()

				expect(privateKey).toBeTruthy()
				expect(publicKey).toBeTruthy()
				expect(keyId).toBeTruthy()

				// Verify format
				expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----')
				expect(privateKey).toContain('-----END PRIVATE KEY-----')
				expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----')
				expect(publicKey).toContain('-----END PUBLIC KEY-----')
				expect(keyId).toMatch(/^[a-z0-9]+$/)

				console.log('\n✓ Valid authentication keys')
				console.log('Key ID:', keyId)
			}
		)
	})

	describe('Environment configuration', () => {
		it('should be forced to staging environment', () => {
			expect(Api.getEnv()).toBe('staging')
		})

		it('should use staging authservices URL', () => {
			const url = Api.getAuthservicesUrl()
			expect(url).toBe('https://staging.authservices.satispay.com')
		})

		it('should have sandbox mode enabled', () => {
			expect(Api.getSandbox()).toBe(true)
		})
	})
})
