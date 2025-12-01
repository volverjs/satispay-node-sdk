import { Request } from './Request.js'
import type {
	ReportCreateBody,
	ReportResponse,
	ReportListQueryParams,
} from './types.js'

/**
 * Report class for managing Satispay payment reports
 * 
 * @remarks
 * The Report API requires special authentication keys that are different from 
 * standard API keys. Contact tech@satispay.com to enable report access.
 * 
 * Reports are extracted at merchant level and include all shops under the merchant.
 * Reports for the previous day should be generated at least 4 hours after midnight
 * to ensure complete data.
 * 
 * @example
 * ```typescript
 * import { Report } from '@volverjs/satispay-node-sdk';
 * 
 * // Create a new report
 * const report = await Report.create({
 *   type: 'PAYMENT_FEE',
 *   format: 'CSV',
 *   from_date: '2025-11-01',
 *   to_date: '2025-11-30'
 * });
 * 
 * // Get list of reports
 * const reports = await Report.all();
 * 
 * // Get a specific report
 * const reportDetails = await Report.get('report-id-123');
 * ```
 */
export class Report {
	/**
	 * Create a new report
	 * 
	 * @param body - Report creation parameters
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the created report
	 * 
	 * @example
	 * ```typescript
	 * const report = await Report.create({
	 *   type: 'PAYMENT_FEE',
	 *   format: 'CSV',
	 *   from_date: '2025-11-01',
	 *   to_date: '2025-11-30',
	 *   columns: ['transaction_id', 'transaction_date', 'total_amount']
	 * });
	 * ```
	 */
	static async create(
		body: ReportCreateBody,
		headers: Record<string, string> = {},
	): Promise<ReportResponse> {
		return await Request.post<ReportResponse>('/g_business/v1/reports', {
			headers,
			body,
			sign: true,
		})
	}

	/**
	 * Retrieve a list of previously created reports
	 * 
	 * @param query - Optional query parameters for pagination
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to an object containing list of reports
	 * 
	 * @example
	 * ```typescript
	 * // Get all reports
	 * const result = await Report.all();
	 * 
	 * // Get reports with pagination
	 * const result = await Report.all({
	 *   limit: 10,
	 *   starting_after: 'report-123'
	 * });
	 * ```
	 */
	static async all(
		query: ReportListQueryParams = {},
		headers: Record<string, string> = {},
	): Promise<{ list: ReportResponse[]; has_more: boolean }> {
		const queryParams = new URLSearchParams()

		if (query.limit) {
			queryParams.append('limit', query.limit.toString())
		}
		if (query.starting_after) {
			queryParams.append('starting_after', query.starting_after)
		}

		const queryString = queryParams.toString()
		const url = queryString
			? `/g_business/v1/reports?${queryString}`
			: '/g_business/v1/reports'

		return await Request.get<{ list: ReportResponse[]; has_more: boolean }>(
			url,
			{
				headers,
				sign: true,
			},
		)
	}

	/**
	 * Retrieve details of a specific report
	 * 
	 * @param id - The report ID
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the report details
	 * 
	 * @example
	 * ```typescript
	 * const report = await Report.get('report-id-123');
	 * 
	 * if (report.status === 'READY' && report.download_url) {
	 *   console.log('Download URL:', report.download_url);
	 * }
	 * ```
	 */
	static async get(
		id: string,
		headers: Record<string, string> = {},
	): Promise<ReportResponse> {
		return await Request.get<ReportResponse>(
			`/g_business/v1/reports/${id}`,
			{
				headers,
				sign: true,
			},
		)
	}
}
