import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Payment } from '../src/Payment'
import { Request } from '../src/Request'
import type { PaymentCreateBody, PaymentResponse } from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}))

describe('Payment', () => {
	const mockPaymentResponse: PaymentResponse = {
		id: 'payment-123',
		code_identifier: 'CODE123',
		type: 'TO_BUSINESS',
		amount_unit: 1000,
		currency: 'EUR',
		status: 'PENDING',
		expired: false,
		metadata: {},
		sender: {
			id: 'sender-123',
			type: 'CONSUMER',
		},
		receiver: {
			id: 'receiver-456',
			type: 'SHOP',
		},
		daily_closure: 'closure-789',
		insert_date: '2025-11-18T10:00:00.000Z',
		expire_date: '2025-11-18T11:00:00.000Z',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('create', () => {
		it('should create a payment with MATCH_CODE flow', async () => {
			const mockBody: PaymentCreateBody = {
				flow: 'MATCH_CODE',
				amount_unit: 1000,
				currency: 'EUR',
			}

			vi.mocked(Request.post).mockResolvedValue(mockPaymentResponse)

			const result = await Payment.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/payments', {
				headers: {},
				body: mockBody,
				sign: true,
			})
			expect(result).toEqual(mockPaymentResponse)
		})

		it('should create a payment using amount in euros', async () => {
			const mockBody: PaymentCreateBody = {
				flow: 'MATCH_CODE',
				amount: 10.50, // 10.50 euros
				currency: 'EUR',
			}

			vi.mocked(Request.post).mockResolvedValue(mockPaymentResponse)

			const result = await Payment.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/payments', {
				headers: {},
				body: {
					flow: 'MATCH_CODE',
					amount_unit: 1050, // Converted to cents
					currency: 'EUR',
				},
				sign: true,
			})
			expect(result).toEqual(mockPaymentResponse)
		})

		it('should handle decimal amounts correctly', async () => {
			const mockBody: PaymentCreateBody = {
				flow: 'MATCH_CODE',
				amount: 99.99,
				currency: 'EUR',
			}

			vi.mocked(Request.post).mockResolvedValue(mockPaymentResponse)

			await Payment.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/payments', 
				expect.objectContaining({
					body: expect.objectContaining({
						amount_unit: 9999,
					}),
				})
			)
		})

		it('should create a payment with custom headers', async () => {
			const mockBody: PaymentCreateBody = {
				flow: 'MATCH_CODE',
				amount_unit: 1000,
				currency: 'EUR',
			}
			const customHeaders = {
				'Idempotency-Key': 'unique-key-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockPaymentResponse)

			await Payment.create(mockBody, customHeaders)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/payments', {
				headers: customHeaders,
				body: mockBody,
				sign: true,
			})
		})

		it('should create a REFUND payment with parent_payment_uid', async () => {
			const mockBody: PaymentCreateBody = {
				flow: 'REFUND',
				amount_unit: 500,
				currency: 'EUR',
				parent_payment_uid: 'parent-payment-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockPaymentResponse)

			await Payment.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/payments',
				expect.objectContaining({
					body: mockBody,
					sign: true,
				})
			)
		})
	})

	describe('get', () => {
		it('should get a payment by id', async () => {
			const paymentId = 'payment-123'
			vi.mocked(Request.get).mockResolvedValue(mockPaymentResponse)

			const result = await Payment.get(paymentId)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/payments/payment-123', {
				headers: {},
				sign: true,
			})
			expect(result).toEqual(mockPaymentResponse)
		})

		it('should get a payment with custom headers', async () => {
			const paymentId = 'payment-123'
			const customHeaders = { 'X-Custom': 'value' }
			vi.mocked(Request.get).mockResolvedValue(mockPaymentResponse)

			await Payment.get(paymentId, customHeaders)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/payments/payment-123', {
				headers: customHeaders,
				sign: true,
			})
		})
	})

	describe('all', () => {
		const mockListResponse = {
			list: [mockPaymentResponse],
			has_more: false,
		}

		it('should get all payments without query params', async () => {
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			const result = await Payment.all()

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/payments', {
				headers: {},
				sign: true,
			})
			expect(result).toEqual(mockListResponse)
		})

		it('should get payments with query parameters', async () => {
			const query = {
				limit: 10,
				starting_after: 'payment-100',
			}
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Payment.all(query)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/payments?limit=10&starting_after=payment-100',
				expect.objectContaining({
					sign: true,
				})
			)
		})

		it('should handle custom headers', async () => {
			const customHeaders = { 'X-Custom': 'header' }
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Payment.all({}, customHeaders)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/payments', {
				headers: customHeaders,
				sign: true,
			})
		})

		it('should convert Date object to timestamp in milliseconds', async () => {
			const testDate = new Date('2024-01-15T10:30:00.000Z')
			const expectedTimestamp = testDate.getTime().toString()
			
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Payment.all({
				starting_after_timestamp: testDate,
				limit: 5,
			})

			expect(Request.get).toHaveBeenCalledWith(
				`/g_business/v1/payments?starting_after_timestamp=${expectedTimestamp}&limit=5`,
				expect.objectContaining({
					sign: true,
				})
			)
		})

		it('should accept timestamp as string without conversion', async () => {
			const timestampString = '1705315800000'
			
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Payment.all({
				starting_after_timestamp: timestampString,
				limit: 5,
			})

			expect(Request.get).toHaveBeenCalledWith(
				`/g_business/v1/payments?starting_after_timestamp=${timestampString}&limit=5`,
				expect.objectContaining({
					sign: true,
				})
			)
		})
	})

	describe('update', () => {
		it('should update a payment', async () => {
			const paymentId = 'payment-123'
			const updateBody = {
				action: 'ACCEPT' as const,
			}
			vi.mocked(Request.put).mockResolvedValue(mockPaymentResponse)

			const result = await Payment.update(paymentId, updateBody)

			expect(Request.put).toHaveBeenCalledWith('/g_business/v1/payments/payment-123', {
				headers: {},
				body: updateBody,
				sign: true,
			})
			expect(result).toEqual(mockPaymentResponse)
		})

		it('should update a payment with amount_unit', async () => {
			const paymentId = 'payment-123'
			const updateBody = {
				action: 'ACCEPT' as const,
				amount_unit: 800,
			}
			vi.mocked(Request.put).mockResolvedValue(mockPaymentResponse)

			await Payment.update(paymentId, updateBody)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/payments/payment-123',
				expect.objectContaining({
					body: updateBody,
					sign: true,
				})
			)
		})

		it('should update a payment with amount in euros', async () => {
			const paymentId = 'payment-123'
			const updateBody = {
				action: 'ACCEPT' as const,
				amount: 7.50, // 7.50 euros
			}
			vi.mocked(Request.put).mockResolvedValue(mockPaymentResponse)

			await Payment.update(paymentId, updateBody)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/payments/payment-123',
				expect.objectContaining({
					body: {
						action: 'ACCEPT',
						amount_unit: 750, // Converted to cents
					},
					sign: true,
				})
			)
		})

		it('should handle decimal amounts in update', async () => {
			const paymentId = 'payment-123'
			const updateBody = {
				action: 'ACCEPT' as const,
				amount: 12.99,
			}
			vi.mocked(Request.put).mockResolvedValue(mockPaymentResponse)

			await Payment.update(paymentId, updateBody)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/payments/payment-123',
				expect.objectContaining({
					body: expect.objectContaining({
						amount_unit: 1299,
					}),
				})
			)
		})

		it('should handle custom headers in update', async () => {
			const paymentId = 'payment-123'
			const updateBody = { action: 'CANCEL' as const }
			const customHeaders = { 'X-Reason': 'customer-request' }
			vi.mocked(Request.put).mockResolvedValue(mockPaymentResponse)

			await Payment.update(paymentId, updateBody, customHeaders)

			expect(Request.put).toHaveBeenCalledWith('/g_business/v1/payments/payment-123', {
				headers: customHeaders,
				body: updateBody,
				sign: true,
			})
		})
	})
})
