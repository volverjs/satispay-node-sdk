import { Request } from './Request.js'
import { DailyClosure as DailyClosureType, DailyClosureQueryParams } from './types.js'
import { DateUtils } from './utils.js'

/**
 * DailyClosure class for retrieving daily closure information
 */
export class DailyClosure {
  private static readonly apiPath = '/g_business/v1/daily_closure'

  /**
   * Get daily closure
   * @see https://developers.satispay.com/reference/retrieve-daily-closure
   * @param date Date object, date in format YYYYMMDD, or undefined for today
   * @param query Query parameters (optional)
   * @param headers Custom headers (optional)
   */
  static async get(
    date?: string | Date,
    query: DailyClosureQueryParams = {},
    headers: Record<string, string> = {}
  ): Promise<DailyClosureType> {
    let dateString: string
    
    if (!date) {
      dateString = DateUtils.formatToYYYYMMDD(new Date())
    } else if (date instanceof Date) {
      dateString = DateUtils.formatToYYYYMMDD(date)
    } else {
      dateString = date
    }

    let path = `${this.apiPath}/${dateString}`

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
