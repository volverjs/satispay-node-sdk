import { Request } from './Request.js'
import { PreAuthorizedPaymentResponse, PreAuthorizedPaymentTokenCreateBody } from './types.js'

/**
 * PreAuthorizedPaymentToken class for managing pre-authorized payment tokens
 */
export class PreAuthorizedPaymentToken {
  private static readonly apiPath = '/g_business/v1/pre_authorized_payment_tokens'

  /**
   * Create a pre-authorized payment token
   * @param body Token data
   * @param headers Custom headers (optional)
   */
  static async create(
    body: PreAuthorizedPaymentTokenCreateBody,
    headers: Record<string, string> = {}
  ): Promise<PreAuthorizedPaymentResponse> {
    return Request.post<PreAuthorizedPaymentResponse>(this.apiPath, {
      headers,
      body,
      sign: true,
    })
  }

  /**
   * Get a pre-authorized payment token
   * @param id Token ID
   * @param headers Custom headers (optional)
   */
  static async get(
    id: string,
    headers: Record<string, string> = {}
  ): Promise<PreAuthorizedPaymentResponse> {
    return Request.get<PreAuthorizedPaymentResponse>(`${this.apiPath}/${id}`, {
      headers,
      sign: true,
    })
  }

  /**
   * Update a pre-authorized payment token
   * @param id Token ID
   * @param body Update data
   * @param headers Custom headers (optional)
   */
  static async update(
    id: string,
    body: {
      status?: string
      metadata?: Record<string, unknown>
    },
    headers: Record<string, string> = {}
  ): Promise<PreAuthorizedPaymentResponse> {
    return Request.put<PreAuthorizedPaymentResponse>(`${this.apiPath}/${id}`, {
      headers,
      body,
      sign: true,
    })
  }
}
