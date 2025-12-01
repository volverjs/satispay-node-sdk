import { Request } from './Request.js'
import { PaymentResponse, PaymentCreateBody, PaymentQueryParams, PaymentUpdateBody } from './types.js'

/**
 * Payment class for managing Satispay payments
 * 
 * This class provides methods to create, retrieve, list, and update payments
 * using the Satispay GBusiness API.
 * 
 * @example
 * ```typescript
 * import { Payment, Amount } from '@volverjs/satispay-node-sdk'
 * 
 * // Create a payment
 * const payment = await Payment.create({
 *   flow: 'MATCH_CODE',
 *   amount_unit: Amount.toCents(10.50), // 1050 cents
 *   currency: 'EUR',
 *   external_code: 'ORDER-123',
 *   metadata: {
 *     description: 'Test payment',
 *   },
 * })
 * 
 * // Get payment details
 * const details = await Payment.get(payment.id)
 * 
 * // List payments with filters
 * const payments = await Payment.list({
 *   starting_date: new Date('2024-01-01'),
 *   limit: 10,
 * })
 * 
 * // Update payment metadata
 * const updated = await Payment.update(payment.id, {
 *   metadata: {
 *     order_status: 'completed',
 *   },
 * })
 * ```
 */
export class Payment {
  private static readonly apiPath = '/g_business/v1/payments'

  /**
   * Create a new payment
   * 
   * Creates a payment request that can be accepted by the user.
   * The payment flow determines how the user will approve the payment:
   * - `MATCH_CODE`: User enters a 6-digit code shown on your interface
   * - `MATCH_USER`: User is matched by phone number (requires phone_number field)
   * - `REFUND`: Creates a refund payment (negative amount)
   * 
   * @param body Payment data including amount, currency, flow, and optional metadata
   * @param headers Custom headers to include in the request (optional)
   * @returns Created payment object with ID, status, and code_identifier
   * 
   * @throws {Error} If the request fails or validation errors occur
   * 
   * @example
   * ```typescript
   * // Create a payment using amount in euros (recommended)
   * const payment = await Payment.create({
   *   flow: 'MATCH_CODE',
   *   amount: 10.50, // 10.50 EUR (automatically converted to cents)
   *   currency: 'EUR',
   *   external_code: 'ORDER-123',
   *   metadata: {
   *     description: 'Pizza Margherita',
   *     customer_email: 'customer@example.com',
   *   },
   * })
   * 
   * // Or using amount_unit in cents
   * const payment2 = await Payment.create({
   *   flow: 'MATCH_CODE',
   *   amount_unit: 1050, // 10.50 EUR in cents
   *   currency: 'EUR',
   * })
   * 
   * console.log(`Payment code: ${payment.code_identifier}`)
   * ```
   */
  static async create(
    body: PaymentCreateBody,
    headers: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    // Convert amount (euros) to amount_unit (cents) if provided
    const processedBody: any = { ...body }
    if ('amount' in body && body.amount !== undefined) {
      processedBody.amount_unit = Math.round(body.amount * 100)
      delete processedBody.amount
    }

    return Request.post<PaymentResponse>(this.apiPath, {
      headers,
      body: processedBody,
      sign: true,
    })
  }

  /**
   * Get payment by id
   * @param id Payment ID
   * @param headers Custom headers (optional)
   */
  static async get(id: string, headers: Record<string, string> = {}): Promise<PaymentResponse> {
    return Request.get<PaymentResponse>(`${this.apiPath}/${id}`, {
      headers,
      sign: true,
    })
  }

  /**
   * Get the payments list
   * 
   * @param query Query parameters (optional)
   * @param headers Custom headers (optional)
   * 
   * @example
   * ```typescript
   * // List all payments
   * const payments = await Payment.all({ limit: 20 })
   * 
   * // Filter by date using Date object (recommended)
   * const yesterday = new Date()
   * yesterday.setDate(yesterday.getDate() - 1)
   * const filtered = await Payment.all({
   *   starting_after_timestamp: yesterday,
   *   limit: 10
   * })
   * 
   * // Or using timestamp string in milliseconds
   * const filteredByString = await Payment.all({
   *   starting_after_timestamp: yesterday.getTime().toString(),
   *   limit: 10
   * })
   * 
   * // Pagination using payment ID
   * const nextPage = await Payment.all({
   *   starting_after: 'last-payment-id',
   *   limit: 20
   * })
   * ```
   * 
   * @note The `starting_after_timestamp` parameter accepts both Date objects and timestamp strings in milliseconds.
   *       Date objects are automatically converted to milliseconds timestamp.
   */
  static async all(
    query: PaymentQueryParams = {},
    headers: Record<string, string> = {}
  ): Promise<{ data: PaymentResponse[]; has_more: boolean }> {
    let path = this.apiPath

    if (Object.keys(query).length > 0) {
      // Convert Date object to timestamp string if necessary
      const processedQuery = { ...query }
      if (processedQuery.starting_after_timestamp instanceof Date) {
        processedQuery.starting_after_timestamp = processedQuery.starting_after_timestamp.getTime().toString()
      }

      const queryString = new URLSearchParams(processedQuery as unknown as Record<string, string>).toString()
      path += `?${queryString}`
    }

    return Request.get(path, {
      headers,
      sign: true,
    })
  }

  /**
   * Update a payment
   * 
   * @param id Payment ID
   * @param body Update data (action and optionally amount or amount_unit)
   * @param headers Custom headers (optional)
   * 
   * @example
   * ```typescript
   * // Update using amount in euros
   * const updated = await Payment.update('payment-id', {
   *   action: 'ACCEPT',
   *   amount: 5.50, // Automatically converted to 550 cents
   * })
   * 
   * // Or using amount_unit in cents
   * const updated2 = await Payment.update('payment-id', {
   *   action: 'ACCEPT',
   *   amount_unit: 550,
   * })
   * ```
   */
  static async update(
    id: string,
    body: Partial<PaymentUpdateBody>,
    headers: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    // Convert amount (euros) to amount_unit (cents) if provided
    const processedBody: any = { ...body }
    if ('amount' in body && body.amount !== undefined) {
      processedBody.amount_unit = Math.round(body.amount * 100)
      delete processedBody.amount
    }

    return Request.put<PaymentResponse>(`${this.apiPath}/${id}`, {
      headers,
      body: processedBody,
      sign: true,
    })
  }
}
