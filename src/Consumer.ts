import { Request } from './Request.js'
import { Consumer as ConsumerType } from './types.js'

/**
 * Consumer class for managing Satispay consumers
 */
export class Consumer {
  private static readonly apiPath = '/g_business/v1/consumers'

  /**
   * Get consumer by phone number
   * @param phoneNumber Consumer phone number (format: +39xxxxxxxxxx)
   * @param headers Custom headers (optional)
   */
  static async get(
    phoneNumber: string,
    headers: Record<string, string> = {}
  ): Promise<ConsumerType> {
    return Request.get<ConsumerType>(`${this.apiPath}/${phoneNumber}`, {
      headers,
      sign: true,
    })
  }
}
