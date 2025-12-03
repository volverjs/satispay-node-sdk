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
		shop_daily_closure: {
			id: '20251118',
			type: 'SHOP_ONLINE',
			customer_uid: '2c544020-2cfb-45ea-b22e-1a0302c54b11',
			gross_amount_unit: 15000,
			refund_amount_unit: 0,
			amount_unit: 15000,
			currency: 'EUR',
		},
		device_daily_closure: {
			id: '20251118',
			type: 'DEVICE',
			customer_uid: '8c061458-e634-440c-8770-86b36eb9d1d6',
			gross_amount_unit: 0,
			refund_amount_unit: 0,
			amount_unit: 0,
			currency: 'EUR',
		},
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

		it('should accept Date object', async () => {
			const date = new Date('2025-11-18')
			vi.mocked(Request.get).mockResolvedValue(mockDailyClosure)

			await DailyClosure.get(date)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/daily_closure/20251118', {
				headers: {},
				sign: true,
			})
		})

		it('should accept string date in YYYYMMDD format', async () => {
			const dateString = '20251118'
			vi.mocked(Request.get).mockResolvedValue(mockDailyClosure)

			await DailyClosure.get(dateString)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/daily_closure/20251118', {
				headers: {},
				sign: true,
			})
		})
	})
})
