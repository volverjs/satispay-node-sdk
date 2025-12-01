import { Request } from './Request.js'
import type {
	SessionCreateBody,
	SessionResponse,
	SessionUpdateBody,
	SessionEventCreateBody,
} from './types.js'

/**
 * Session class for managing Satispay POS sessions
 * 
 * @remarks
 * Sessions are used for POS/device integration to manage fund lock payments
 * across multiple transactions. A session allows charging a fund lock incrementally
 * through multiple events.
 * 
 * @example
 * ```typescript
 * import { Session } from '@volverjs/satispay-node-sdk';
 * 
 * // Open a session from a fund lock
 * const session = await Session.open({
 *   fund_lock_id: 'payment-123'
 * });
 * 
 * // Add items to the session
 * await Session.createEvent(session.id, {
 *   type: 'ADD_ITEM',
 *   amount_unit: 500,
 *   description: 'Product A'
 * });
 * 
 * // Get session details
 * const details = await Session.get(session.id);
 * 
 * // Close the session
 * await Session.update(session.id, { status: 'CLOSE' });
 * ```
 */
export class Session {
	/**
	 * Open a new session from a fund lock payment
	 * 
	 * @param body - Session creation parameters containing the fund lock ID
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the created session
	 * 
	 * @example
	 * ```typescript
	 * const session = await Session.open({
	 *   fund_lock_id: 'payment-fund-lock-123'
	 * });
	 * console.log('Session ID:', session.id);
	 * console.log('Residual amount:', session.residual_amount_unit);
	 * ```
	 */
	static async open(
		body: SessionCreateBody,
		headers: Record<string, string> = {},
	): Promise<SessionResponse> {
		return await Request.post<SessionResponse>('/g_business/v1/sessions', {
			headers,
			body,
			sign: true,
		})
	}

	/**
	 * Retrieve details of a specific session
	 * 
	 * @param id - The session ID
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the session details
	 * 
	 * @example
	 * ```typescript
	 * const session = await Session.get('session-123');
	 * console.log('Status:', session.status);
	 * console.log('Residual amount:', session.residual_amount_unit);
	 * ```
	 */
	static async get(
		id: string,
		headers: Record<string, string> = {},
	): Promise<SessionResponse> {
		return await Request.get<SessionResponse>(
			`/g_business/v1/sessions/${id}`,
			{
				headers,
				sign: true,
			},
		)
	}

	/**
	 * Update a session (typically to close it)
	 * 
	 * @param id - The session ID
	 * @param body - Session update parameters
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the updated session
	 * 
	 * @example
	 * ```typescript
	 * // Close a session
	 * const closedSession = await Session.update('session-123', {
	 *   status: 'CLOSE'
	 * });
	 * console.log('Final status:', closedSession.status);
	 * ```
	 */
	static async update(
		id: string,
		body: SessionUpdateBody,
		headers: Record<string, string> = {},
	): Promise<SessionResponse> {
		return await Request.patch<SessionResponse>(
			`/g_business/v1/sessions/${id}`,
			{
				headers,
				body,
				sign: true,
			},
		)
	}

	/**
	 * Create an event within a session
	 * 
	 * @remarks
	 * Events are used to add, remove, or update items in a POS session.
	 * Each event can modify the total amount being charged from the fund lock.
	 * 
	 * @param id - The session ID
	 * @param body - Event creation parameters
	 * @param headers - Optional custom headers
	 * @returns Promise resolving to the updated session after the event
	 * 
	 * @example
	 * ```typescript
	 * // Add an item to the session
	 * await Session.createEvent('session-123', {
	 *   type: 'ADD_ITEM',
	 *   amount_unit: 1000,
	 *   description: 'Coffee',
	 *   metadata: { sku: 'COFFEE-001' }
	 * });
	 * 
	 * // Remove an item
	 * await Session.createEvent('session-123', {
	 *   type: 'REMOVE_ITEM',
	 *   amount_unit: 500,
	 *   description: 'Discount applied'
	 * });
	 * ```
	 */
	static async createEvent(
		id: string,
		body: SessionEventCreateBody,
		headers: Record<string, string> = {},
	): Promise<SessionResponse> {
		return await Request.post<SessionResponse>(
			`/g_business/v1/sessions/${id}/events`,
			{
				headers,
				body,
				sign: true,
			},
		)
	}
}
