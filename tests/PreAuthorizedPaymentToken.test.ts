import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { PreAuthorizedPaymentToken } from '../src/PreAuthorizedPaymentToken'
import { Request } from '../src/Request'
import type {
	PreAuthorizedPaymentResponse,
	PreAuthorizedPaymentTokenCreateBody,
} from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}))

describe('PreAuthorizedPaymentToken', () => {
	const mockTokenResponse: PreAuthorizedPaymentResponse = {
		id: 'token-123',
		token: 'TOKEN_ABC123',
		status: 'PENDING',
		consumer_uid: 'consumer-456',
		expire_date: '2025-12-18T10:00:00.000Z',
		metadata: { note: 'test' },
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('create', () => {
		it('should create a pre-authorized payment token', async () => {
			const createBody: PreAuthorizedPaymentTokenCreateBody = {
				reason: 'Subscription payment',
				callback_url: 'https://example.com/callback',
			}
			vi.mocked(Request.post).mockResolvedValue(mockTokenResponse)

			const result = await PreAuthorizedPaymentToken.create(createBody)

			expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens',
				{
					headers: {},
					body: createBody,
					sign: true,
				}
			)
			expect(result).toEqual(mockTokenResponse)
		})

		it('should create token with custom headers', async () => {
			const createBody: PreAuthorizedPaymentTokenCreateBody = {
				reason: 'Subscription',
			}
			const customHeaders = { 'Idempotency-Key': 'unique-123' }
			vi.mocked(Request.post).mockResolvedValue(mockTokenResponse)

			await PreAuthorizedPaymentToken.create(createBody, customHeaders)

			expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens',
				{
					headers: customHeaders,
					body: createBody,
					sign: true,
				}
			)
		})

		it('should create token with redirect_url', async () => {
			const createBody: PreAuthorizedPaymentTokenCreateBody = {
				reason: 'Setup',
				redirect_url: 'https://example.com/success',
			}
			vi.mocked(Request.post).mockResolvedValue(mockTokenResponse)

			await PreAuthorizedPaymentToken.create(createBody)

			expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens',
				expect.objectContaining({
					body: createBody,
				})
			)
		})
	})

	describe('get', () => {
		it('should get a pre-authorized payment token by id', async () => {
			const tokenId = 'token-123'
			vi.mocked(Request.get).mockResolvedValue(mockTokenResponse)

			const result = await PreAuthorizedPaymentToken.get(tokenId)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens/token-123',
				{
					headers: {},
					sign: true,
				}
			)
			expect(result).toEqual(mockTokenResponse)
		})

		it('should get token with custom headers', async () => {
			const tokenId = 'token-123'
			const customHeaders = { 'X-Custom': 'value' }
			vi.mocked(Request.get).mockResolvedValue(mockTokenResponse)

			await PreAuthorizedPaymentToken.get(tokenId, customHeaders)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens/token-123',
				{
					headers: customHeaders,
					sign: true,
				}
			)
		})
	})

	describe('update', () => {
		it('should update a pre-authorized payment token', async () => {
			const tokenId = 'token-123'
			const updateBody = {
				status: 'ACCEPTED',
			}
			vi.mocked(Request.put).mockResolvedValue(mockTokenResponse)

			const result = await PreAuthorizedPaymentToken.update(tokenId, updateBody)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens/token-123',
				{
					headers: {},
					body: updateBody,
					sign: true,
				}
			)
			expect(result).toEqual(mockTokenResponse)
		})

		it('should update token with metadata', async () => {
			const tokenId = 'token-123'
			const updateBody = {
				metadata: { updated: true },
			}
			vi.mocked(Request.put).mockResolvedValue(mockTokenResponse)

			await PreAuthorizedPaymentToken.update(tokenId, updateBody)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens/token-123',
				expect.objectContaining({
					body: updateBody,
				})
			)
		})

		it('should update token with custom headers', async () => {
			const tokenId = 'token-123'
			const updateBody = {
				status: 'CANCELED',
			}
			const customHeaders = { 'X-Reason': 'expired' }
			vi.mocked(Request.put).mockResolvedValue(mockTokenResponse)

			await PreAuthorizedPaymentToken.update(tokenId, updateBody, customHeaders)

			expect(Request.put).toHaveBeenCalledWith(
				'/g_business/v1/pre_authorized_payment_tokens/token-123',
				{
					headers: customHeaders,
					body: updateBody,
					sign: true,
				}
			)
		})
	})
})
