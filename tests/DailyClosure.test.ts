import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { DailyClosure } from '../src/DailyClosure'
import { Request } from '../src/Request'
import type { DailyClosure as DailyClosureType } from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
	},
}))

describe('DailyClosure', () => {
	const mockDailyClosure: DailyClosureType = {
		date: '2025-11-18',
		total_amount_unit: 15000,
		currency: 'EUR',
		payments_count: 25,
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('get', () => {
		it('should get daily closure by date', async () => {
			const date = '20251118'
			vi.mocked(Request.get).mockResolvedValue(mockDailyClosure)

			const result = await DailyClosure.get(date)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/daily_closure/20251118', {
				headers: {},
				sign: true,
			})
			expect(result).toEqual(mockDailyClosure)
		})

		it('should get daily closure with query parameters', async () => {
			const date = '20251118'
			const query = { limit: 10 }
			vi.mocked(Request.get).mockResolvedValue(mockDailyClosure)

			await DailyClosure.get(date, query)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/daily_closure/20251118?limit=10',
				expect.objectContaining({
					sign: true,
				})
			)
		})

		it('should use today date when no date provided', async () => {
			vi.mocked(Request.get).mockResolvedValue(mockDailyClosure)

			await DailyClosure.get()

			const callArg = vi.mocked(Request.get).mock.calls[0][0]
			expect(callArg).toMatch(/^\/g_business\/v1\/daily_closure\/\d{8}/)
		})
	})
})
