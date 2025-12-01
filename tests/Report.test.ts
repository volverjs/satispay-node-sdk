import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Report } from '../src/Report'
import { Request } from '../src/Request'
import type { ReportResponse, ReportCreateBody } from '../src/types'

// Mock Request module
vi.mock('../src/Request', () => ({
	Request: {
		get: vi.fn(),
		post: vi.fn(),
	},
}))

describe('Report', () => {
	const mockReportResponse: ReportResponse = {
		id: 'report-123',
		type: 'PAYMENT_FEE',
		format: 'CSV',
		status: 'READY',
		from_date: '2025-11-01',
		to_date: '2025-11-30',
		download_url: 'https://example.com/report.csv',
		created_at: '2025-12-01T10:00:00.000Z',
		updated_at: '2025-12-01T10:30:00.000Z',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('create', () => {
		it('should create a new report', async () => {
			const mockBody: ReportCreateBody = {
				type: 'PAYMENT_FEE',
				format: 'CSV',
				from_date: '2025-11-01',
				to_date: '2025-11-30',
			}

			vi.mocked(Request.post).mockResolvedValue(mockReportResponse)

			const result = await Report.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/reports', {
				headers: {},
				body: mockBody,
				sign: true,
			})
			expect(result).toEqual(mockReportResponse)
		})

		it('should create a report with custom columns', async () => {
			const mockBody: ReportCreateBody = {
				type: 'PAYMENT_FEE',
				format: 'XLSX',
				from_date: '2025-11-01',
				to_date: '2025-11-30',
				columns: ['transaction_id', 'transaction_date', 'total_amount'],
			}

			vi.mocked(Request.post).mockResolvedValue(mockReportResponse)

			await Report.create(mockBody)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/reports', {
				headers: {},
				body: mockBody,
				sign: true,
			})
		})

		it('should create a report with custom headers', async () => {
			const mockBody: ReportCreateBody = {
				type: 'PAYMENT_FEE',
				format: 'PDF',
				from_date: '2025-11-01',
				to_date: '2025-11-30',
			}
			const customHeaders = {
				'Idempotency-Key': 'report-unique-123',
			}

			vi.mocked(Request.post).mockResolvedValue(mockReportResponse)

			await Report.create(mockBody, customHeaders)

			expect(Request.post).toHaveBeenCalledWith('/g_business/v1/reports', {
				headers: customHeaders,
				body: mockBody,
				sign: true,
			})
		})
	})

	describe('all', () => {
		const mockListResponse = {
			list: [mockReportResponse],
			has_more: false,
		}

		it('should get all reports without query params', async () => {
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			const result = await Report.all()

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/reports', {
				headers: {},
				sign: true,
			})
			expect(result).toEqual(mockListResponse)
		})

		it('should get reports with pagination', async () => {
			const query = {
				limit: 10,
				starting_after: 'report-100',
			}
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Report.all(query)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/reports?limit=10&starting_after=report-100',
				expect.objectContaining({
					sign: true,
				}),
			)
		})

		it('should handle custom headers', async () => {
			const customHeaders = { 'X-Custom': 'header' }
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Report.all({}, customHeaders)

			expect(Request.get).toHaveBeenCalledWith('/g_business/v1/reports', {
				headers: customHeaders,
				sign: true,
			})
		})

		it('should get reports with limit only', async () => {
			const query = { limit: 5 }
			vi.mocked(Request.get).mockResolvedValue(mockListResponse)

			await Report.all(query)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/reports?limit=5',
				expect.objectContaining({
					sign: true,
				}),
			)
		})
	})

	describe('get', () => {
		it('should get a report by id', async () => {
			const reportId = 'report-123'
			vi.mocked(Request.get).mockResolvedValue(mockReportResponse)

			const result = await Report.get(reportId)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/reports/report-123',
				{
					headers: {},
					sign: true,
				},
			)
			expect(result).toEqual(mockReportResponse)
		})

		it('should get a report with custom headers', async () => {
			const reportId = 'report-123'
			const customHeaders = { 'X-Custom': 'value' }
			vi.mocked(Request.get).mockResolvedValue(mockReportResponse)

			await Report.get(reportId, customHeaders)

			expect(Request.get).toHaveBeenCalledWith(
				'/g_business/v1/reports/report-123',
				{
					headers: customHeaders,
					sign: true,
				},
			)
		})

		it('should handle pending report status', async () => {
			const pendingReport: ReportResponse = {
				...mockReportResponse,
				status: 'PENDING',
				download_url: undefined,
			}
			vi.mocked(Request.get).mockResolvedValue(pendingReport)

			const result = await Report.get('report-123')

			expect(result.status).toBe('PENDING')
			expect(result.download_url).toBeUndefined()
		})

		it('should handle failed report status', async () => {
			const failedReport: ReportResponse = {
				...mockReportResponse,
				status: 'FAILED',
				download_url: undefined,
			}
			vi.mocked(Request.get).mockResolvedValue(failedReport)

			const result = await Report.get('report-123')

			expect(result.status).toBe('FAILED')
			expect(result.download_url).toBeUndefined()
		})
	})
})
