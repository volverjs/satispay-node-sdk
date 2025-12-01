import { Request } from './Request.js'
import { DailyClosure as DailyClosureType, DailyClosureQueryParams } from './types.js'

/**
 * DailyClosure class for retrieving daily closure information
 */
export class DailyClosure {
  private static readonly apiPath = '/g_business/v1/daily_closure'

  /**
   * Get daily closure
   * @see https://developers.satispay.com/reference/retrieve-daily-closure
   * @param date Date in format YYYYMMDD (default: today)
   * @param query Query parameters (optional)
   * @param headers Custom headers (optional)
   */
  static async get(
    date?: string,
    query: DailyClosureQueryParams = {},
    headers: Record<string, string> = {}
  ): Promise<DailyClosureType> {
    if (!date) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      date = `${year}${month}${day}`
    }

    let path = `${this.apiPath}/${date}`

    if (Object.keys(query).length > 0) {
      const queryParams = new URLSearchParams()
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
      path += `?${queryParams.toString()}`
    }

    return Request.get<DailyClosureType>(path, {
      headers,
      sign: true,
    })
  }
}
