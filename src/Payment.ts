import { Request } from './Request.js'
import { PaymentResponse, PaymentCreateBody, PaymentQueryParams, PaymentUpdateBody } from './types.js'

/**
 * Payment class for managing Satispay payments
 */
export class Payment {
  private static readonly apiPath = '/g_business/v1/payments'

  /**
   * Create a payment
   * @param body Payment data
   * @param headers Custom headers (optional)
   */
  static async create(
    body: PaymentCreateBody,
    headers: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    return Request.post<PaymentResponse>(this.apiPath, {
      headers,
      body,
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
   * @param query Query parameters (optional)
   * @param headers Custom headers (optional)
   */
  static async all(
    query: PaymentQueryParams = {},
    headers: Record<string, string> = {}
  ): Promise<{ list: PaymentResponse[]; has_more: boolean }> {
    let path = this.apiPath

    if (Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query as unknown as Record<string, string>).toString()
      path += `?${queryString}`
    }

    return Request.get(path, {
      headers,
      sign: true,
    })
  }

  /**
   * Update a payment
   * @param id Payment ID
   * @param body Update data
   * @param headers Custom headers (optional)
   */
  static async update(
    id: string,
    body: Partial<PaymentUpdateBody>,
    headers: Record<string, string> = {}
  ): Promise<PaymentResponse> {
    return Request.put<PaymentResponse>(`${this.apiPath}/${id}`, {
      headers,
      body,
      sign: true,
    })
  }
}
