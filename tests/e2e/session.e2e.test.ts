import { describe, it, expect, beforeAll } from 'vitest'
import { Payment } from '../../src/Payment'
import { CodeGenerator } from '../../src/utils'
import { canRunE2ETests, hasAuthenticationKeys } from '../setup'

/**
 * E2E tests for Fund Lock Payment with Satispay
 * 
 * These tests require:
 * - SATISPAY_PUBLIC_KEY, SATISPAY_PRIVATE_KEY, SATISPAY_KEY_ID configured
 * - Staging or test environment
 * 
 * NOTE: These tests create real fund lock payments.
 * Use only with test/staging environments.
 */

describe.skipIf(!canRunE2ETests() || !hasAuthenticationKeys())('E2E: Fund Lock Payment', () => {
	let fundLockPaymentId: string | undefined

	beforeAll(() => {
		console.log('\n⚠️  WARNING: These tests create real fund lock payments')
		console.log('Make sure you are in staging/test environment\n')
	})

	it('should create a fund lock payment', async () => {
		const externalCode = CodeGenerator.generateExternalCode('E2E-FUNDLOCK')
		const amount = 50.00 // 50 euros

		const payment = await Payment.create({
			flow: 'FUND_LOCK',
			amount: amount,
			currency: 'EUR',
			external_code: externalCode,
			metadata: {
				test: 'e2e-fundlock-test',
				timestamp: new Date().toISOString(),
			},
		})

		// Verify response
		expect(payment.id).toBeTruthy()
		expect(payment.amount_unit).toBe(5000) // 50 EUR in cents
		expect(payment.currency).toBe('EUR')
		expect(payment.external_code).toBe(externalCode)
		expect(payment.status).toBe('PENDING')
		expect(payment.code_identifier).toBeTruthy()

		fundLockPaymentId = payment.id

		console.log('\n✅ Fund lock created:', payment.id)
		console.log('📱 Code to scan:', payment.code_identifier)
		console.log('⏳ Status:', payment.status)
	}, 10000)

	it('should get fund lock payment details', async () => {
		expect(fundLockPaymentId).toBeTruthy()

		const payment = await Payment.get(fundLockPaymentId!)

		expect(payment.id).toBe(fundLockPaymentId)
		expect(payment.amount_unit).toBe(5000)
		expect(payment.currency).toBe('EUR')
		
		console.log('📊 Fund lock status:', payment.status)
		console.log('💰 Amount:', payment.amount_unit / 100, 'EUR')
	})
})
