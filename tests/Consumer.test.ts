import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Consumer } from '../src/Consumer'
import { Request } from '../src/Request'
import type { Consumer as ConsumerType } from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
	},
}))

describe('Consumer', () => {
	const mockConsumer: ConsumerType = {
		id: 'consumer-123',
		type: 'CONSUMER',
		name: 'John Doe',
		phone_number: '+393331234567',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('get', () => {
		it('should get consumer by id', async () => {
			const consumerId = 'consumer-123'
			vi.mocked(Request.get).mockResolvedValue(mockConsumer)

			const result = await Consumer.get(consumerId)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/consumers/consumer-123', {
				headers: {},
				sign: true,
			})
			expect(result).toEqual(mockConsumer)
		})

		it('should get consumer with custom headers', async () => {
			const consumerId = 'consumer-123'
			const customHeaders = { 'X-Custom': 'value' }
			vi.mocked(Request.get).mockResolvedValue(mockConsumer)

			await Consumer.get(consumerId, customHeaders)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/consumers/consumer-123', {
				headers: customHeaders,
				sign: true,
			})
		})

		it('should handle consumer without optional fields', async () => {
			const minimalConsumer: ConsumerType = {
				id: 'consumer-456',
				type: 'CONSUMER',
			}
			vi.mocked(Request.get).mockResolvedValue(minimalConsumer)

			const result = await Consumer.get('consumer-456')

			expect(result).toEqual(minimalConsumer)
			expect(result.name).toBeUndefined()
			expect(result.phone_number).toBeUndefined()
		})
	})
})
