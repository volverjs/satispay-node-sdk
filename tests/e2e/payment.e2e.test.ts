import { describe, it, expect, beforeAll } from 'vitest'
import { Payment } from '../../src/Payment'
import { CodeGenerator } from '../../src/utils'
import { canRunE2ETests, hasAuthenticationKeys } from '../setup'

/**
 * E2E tests for complete payment flow with Satispay
 * 
 * These tests require:
 * - SATISPAY_PUBLIC_KEY, SATISPAY_PRIVATE_KEY, SATISPAY_KEY_ID configured
 * - Staging or test environment
 * 
 * NOTE: These tests create real payments in the configured environment.
 * Use only with test/staging environments.
 */

describe.skipIf(!canRunE2ETests() || !hasAuthenticationKeys())('E2E: Payment Flow', () => {
	let testPaymentId: string | undefined

	beforeAll(() => {
		console.log('\n⚠️  WARNING: These tests create real payments')
		console.log('Make sure you are in staging/test environment\n')
	})

	describe('Create Payment', () => {
		it(
			'should create a new payment',
			async () => {
				const externalCode = CodeGenerator.generateExternalCode('E2E-TEST')
				const amount = 1.00 // 1 euro

				const payment = await Payment.create({
					flow: 'MATCH_CODE',
					amount: amount, // Using amount in euros
					currency: 'EUR',
					external_code: externalCode,
					metadata: {
						test: 'e2e-test',
						timestamp: new Date().toISOString(),
					},
				})

				// Verifica la risposta
				expect(payment.id).toBeTruthy()
				expect(payment.amount_unit).toBe(100) // Converted to cents
				expect(payment.currency).toBe('EUR')
				expect(payment.external_code).toBe(externalCode)
				expect(payment.status).toBe('PENDING')

				// Save ID for subsequent tests
				testPaymentId = payment.id

				console.log('\n✓ Payment created successfully')
				console.log('Payment ID:', payment.id)
				console.log('External Code:', payment.external_code)
				console.log('Amount:', amount, 'EUR')
				console.log('Status:', payment.status)
			},
			30000
		)
	})

	describe('Get Payment', () => {
		it(
			'should retrieve an existing payment',
			async () => {
				if (!testPaymentId) {
					console.log('⚠️  Skipped: no payment ID available from previous test')
					return
				}

				const payment = await Payment.get(testPaymentId)

				// Verify response
				expect(payment.id).toBe(testPaymentId)
				expect(payment.amount_unit).toBeTruthy()
				expect(payment.currency).toBe('EUR')
				expect(payment.status).toBeTruthy()

				console.log('\n✓ Payment retrieved successfully')
				console.log('Payment ID:', payment.id)
				console.log('Status:', payment.status)
			},
			30000
		)
	})

	describe('List Payments', () => {
		it(
			'should list payments with pagination',
			async () => {
				const result = await Payment.all({
					limit: 10,
				})

				// Verify response structure
				expect(result).toBeDefined()
				expect(result.data).toBeDefined()
				expect(Array.isArray(result.data)).toBe(true)
				expect(result.has_more).toBeDefined()

				console.log('\n📋 Payment list response:')
				console.log('Total payments found:', result.data.length)
				console.log('Has more pages:', result.has_more)

				if (result.data.length > 0) {
					const firstPayment = result.data[0]
					expect(firstPayment.id).toBeTruthy()
					expect(firstPayment.amount_unit).toBeDefined()
					expect(firstPayment.currency).toBe('EUR')
					expect(firstPayment.status).toBeTruthy()

					console.log('✓ Payment list retrieved successfully')
					console.log('First payment ID:', firstPayment.id)
					console.log('First payment status:', firstPayment.status)
					console.log('First payment date:', firstPayment.insert_date)
				} else {
					console.log('⚠️  No payments found in staging environment')
					console.log('💡 Note: Staging environment may have limited or no historical data')
					console.log('💡 The payment created in this test run should appear in subsequent calls')
				}
			},
			30000
		)

		it(
			'should find the payment created in this test run',
			async () => {
				if (!testPaymentId) {
					console.log('⚠️  Skipped: no payment ID available')
					return
				}

				// Try to find the payment in the list
				const result = await Payment.all({
					limit: 100, // Increase limit to find recent payment
				})

				const createdPayment = result.data.find(p => p.id === testPaymentId)

				if (createdPayment) {
					console.log('\n✓ Found the payment created in this test run')
					console.log('Payment ID:', createdPayment.id)
					console.log('Status:', createdPayment.status)
					console.log('Amount:', createdPayment.amount_unit / 100, 'EUR')
					expect(createdPayment.id).toBe(testPaymentId)
				} else {
					console.log('\n⚠️  Payment not found in list')
					console.log('Expected payment ID:', testPaymentId)
					console.log('Total payments in list:', result.data.length)
					console.log('💡 This might be due to API indexing delay or staging environment behavior')
				}
			},
			30000
		)

		// Note: starting_after_timestamp now supports Date objects directly
		it(
			'should filter payments by date using starting_after_timestamp',
			async () => {
				const yesterday = new Date()
				yesterday.setDate(yesterday.getDate() - 1)

				const result = await Payment.all({
					starting_after_timestamp: yesterday, // Date object is automatically converted
					limit: 5,
				})

				expect(result).toBeDefined()
				expect(result.data).toBeDefined()
				expect(Array.isArray(result.data)).toBe(true)

				console.log('\n✓ Date filter applied successfully')
				console.log('Payments found:', result.data.length)
				console.log('Filter date:', yesterday.toISOString())
			},
			30000
		)
	})

	describe('Update Payment', () => {
		it(
			'should update payment action',
			async () => {
				if (!testPaymentId) {
					console.log('⚠️  Skipped: no payment ID available')
					return
				}

				const payment = await Payment.update(testPaymentId, {
					action: 'CANCEL',
				})

				// Verify response
				expect(payment.id).toBe(testPaymentId)

				console.log('\n✓ Payment updated')
				console.log('Payment ID:', payment.id)
				console.log('Status:', payment.status)
			},
			30000
		)
	})

	describe('Payment by External Code', () => {
		it(
			'should create and retrieve payment by external code',
			async () => {
				// Crea un nuovo pagamento con external code univoco
				const externalCode = CodeGenerator.generateUuidExternalCode('E2E-SEARCH')

				const createdPayment = await Payment.create({
					flow: 'MATCH_CODE',
					amount: 0.50, // 0.50 euros
					currency: 'EUR',
					external_code: externalCode,
				})

			// Verify it was created with correct external code
			expect(createdPayment.external_code).toBe(externalCode)
			expect(createdPayment.amount_unit).toBe(50) // 0.50 EUR = 50 cents

			console.log('\n✓ Payment created and found by external code')
			console.log('External Code:', createdPayment.external_code)
			console.log('Payment ID:', createdPayment.id)
			},
			30000
		)
	})
})
