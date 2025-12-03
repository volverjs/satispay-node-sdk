import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Session } from '../src/Session'
import { Request } from '../src/Request'
import type {
	SessionResponse,
	SessionCreateBody,
	SessionUpdateBody,
	SessionEventCreateBody,
} from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}))

describe('Session', () => {
	const mockSessionResponse: SessionResponse = {
		id: 'session-123',
		amount_unit: 5000,
		residual_amount_unit: 5000,
		currency: 'EUR',
		status: 'OPEN',
		type: 'TO_BUSINESS_CHARGE',
		consumer_uid: 'consumer-456',
		available: true,
		expiration_date: '2025-12-01T18:00:00.000Z',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('open', () => {
		it('should open a new session', async () => {
			const mockBody: SessionCreateBody = {
				fund_lock_id: 'payment-fund-lock-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockSessionResponse)

			const result = await Session.open(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/sessions', {
				headers: {},
				body: mockBody,
				sign: true,
			})
			expect(result).toEqual(mockSessionResponse)
		})

		it('should open a session with custom headers', async () => {
			const mockBody: SessionCreateBody = {
				fund_lock_id: 'payment-fund-lock-456',
			}
			const customHeaders = {
				'Idempotency-Key': 'session-unique-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockSessionResponse)

			await Session.open(mockBody, customHeaders)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/sessions', {
				headers: customHeaders,
				body: mockBody,
				sign: true,
			})
		})
	})

	describe('get', () => {
		it('should get session details by id', async () => {
			const sessionId = 'session-123'
			vi.mocked(Request.get).mockResolvedValue(mockSessionResponse)

			const result = await Session.get(sessionId)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123',
				{
					headers: {},
					sign: true,
				},
			)
			expect(result).toEqual(mockSessionResponse)
		})

		it('should get session with custom headers', async () => {
			const sessionId = 'session-123'
			const customHeaders = { 'X-Custom': 'value' }
			vi.mocked(Request.get).mockResolvedValue(mockSessionResponse)

			await Session.get(sessionId, customHeaders)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123',
				{
					headers: customHeaders,
					sign: true,
				},
			)
		})

		it('should get session with reduced residual amount', async () => {
			const sessionWithCharges: SessionResponse = {
				...mockSessionResponse,
				residual_amount_unit: 3000,
			}
			vi.mocked(Request.get).mockResolvedValue(sessionWithCharges)

			const result = await Session.get('session-123')

			expect(result.residual_amount_unit).toBe(3000)
			expect(result.amount_unit).toBe(5000)
		})
	})

	describe('update', () => {
		it('should close a session', async () => {
			const sessionId = 'session-123'
			const updateBody: SessionUpdateBody = {
				status: 'CLOSE',
			}
			const closedSession: SessionResponse = {
				...mockSessionResponse,
				status: 'CLOSE',
				residual_amount_unit: 0,
			}

			vi.mocked(Request.patch).mockResolvedValue(closedSession)

			const result = await Session.update(sessionId, updateBody)

			expect(Request.patch).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123',
				{
					headers: {},
					body: updateBody,
					sign: true,
				},
			)
			expect(result).toEqual(closedSession)
			expect(result.status).toBe('CLOSE')
		})

		it('should update session with custom headers', async () => {
			const sessionId = 'session-123'
			const updateBody: SessionUpdateBody = {
				status: 'CLOSE',
			}
			const customHeaders = { 'X-Reason': 'customer-request' }

			vi.mocked(Request.patch).mockResolvedValue(mockSessionResponse)

			await Session.update(sessionId, updateBody, customHeaders)

			expect(Request.patch).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123',
				{
					headers: customHeaders,
					body: updateBody,
					sign: true,
				},
			)
		})
	})

	describe('createEvent', () => {
	it('should add an item to the session', async () => {
		const sessionId = 'session-123'
		const eventBody: SessionEventCreateBody = {
			operation: 'ADD',
			amount_unit: 1000,
			currency: 'EUR',
			description: 'Coffee',
		}
		const updatedSession: SessionResponse = {
			...mockSessionResponse,
			residual_amount_unit: 4000,
		}

		vi.mocked(Request.post).mockResolvedValue(updatedSession)

		const result = await Session.createEvent(sessionId, eventBody)

		expect(Request.post).toHaveBeenCalledWith(
			'/g_business/v1/sessions/session-123/events',
			{
				headers: {},
				body: eventBody,
				sign: true,
			},
		)
		expect(result.residual_amount_unit).toBe(4000)
	})

	it('should remove an item from the session', async () => {
		const sessionId = 'session-123'
		const eventBody: SessionEventCreateBody = {
			operation: 'REMOVE',
			amount_unit: 500,
			currency: 'EUR',
			description: 'Discount applied',
		}

		vi.mocked(Request.post).mockResolvedValue(mockSessionResponse)

		await Session.createEvent(sessionId, eventBody)

		expect(Request.post).toHaveBeenCalledWith(
			'/g_business/v1/sessions/session-123/events',
			{
				headers: {},
				body: eventBody,
				sign: true,
			},
		)
	})

	it('should create event with metadata', async () => {
		const sessionId = 'session-123'
		const eventBody: SessionEventCreateBody = {
			operation: 'ADD',
			amount_unit: 1200,
			currency: 'EUR',
			description: 'Espresso',
			metadata: {
				sku: 'COFFEE-001',
			category: 'beverages',
		},
	}

	vi.mocked(Request.post).mockResolvedValue(mockSessionResponse)

	await Session.createEvent(sessionId, eventBody)

	expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123/events',
				expect.objectContaining({
					body: expect.objectContaining({
						metadata: {
							sku: 'COFFEE-001',
							category: 'beverages',
						},
					}),
				}),
			)
		})

		it('should create event with custom headers', async () => {
			const sessionId = 'session-123'
			const eventBody: SessionEventCreateBody = {
				operation: 'ADD',
				amount_unit: 800,
				currency: 'EUR',
			}
			const customHeaders = {
				'Idempotency-Key': 'event-unique-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockSessionResponse)

			await Session.createEvent(sessionId, eventBody, customHeaders)

			expect(Request.post).toHaveBeenCalledWith(
				'/g_business/v1/sessions/session-123/events',
				{
					headers: customHeaders,
					body: eventBody,
					sign: true,
				},
			)
		})
	})
})
