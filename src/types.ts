/**
 * Interface for RSA key pair generation result
 */
export type RSAKeyPair = {
  privateKey: string
  publicKey: string
}

/**
 * Request options
 */
export type RequestOptions = {
  headers?: Record<string, string>
  body?: unknown
  sign?: boolean
}

/**
 * HTTP method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Environment
 */
export type Environment = 'production' | 'staging'

/**
 * Payment status
 */
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'ACCEPTED' | 'CANCELED'

/**
 * Payment flow
 */
export type PaymentFlow =
  | 'MATCH_CODE'
  | 'MATCH_USER'
  | 'REFUND'
  | 'PRE_AUTHORIZED'
  | 'FUND_LOCK'
  | 'PRE_AUTHORIZED_FUND_LOCK'
  | 'HOTP_AUTH'

/**
 * Report type
 */
export type ReportType = 'PAYMENT_FEE'

/**
 * Report format type
 */
export type ReportFormatType = 'CSV' | 'PDF' | 'XLSX'

/**
 * Report status
 */
export type ReportStatus = 'PENDING' | 'READY' | 'FAILED'

/**
 * Session status
 */
export type SessionStatus = 'OPEN' | 'CLOSE'

/**
 * Session event operation
 */
export type SessionEventOperation = 'ADD' | 'REMOVE'

/**
 * Payment action
 */
export type PaymentAction = 'ACCEPT' | 'CANCEL' | 'CANCEL_OR_REFUND'

/**
 * Payment type
 */
export type PaymentType = 'TO_BUSINESS' | 'REFUND_TO_BUSINESS'

/**
 * Actor type
 */
export type Actor = 'CONSUMER' | 'SHOP'

/**
 * Pre-authorized token status
 */

export type PreAuthorizedTokenStatus = 'PENDING' | 'ACCEPTED' | 'CANCELED'

/**
 * Payment creation body
 * 
 * @property amount - Amount in euros (e.g., 10.50). Will be automatically converted to amount_unit.
 * @property amount_unit - Amount in cents (e.g., 1050). Use either 'amount' or 'amount_unit', not both.
 * @property meal_voucher_max_amount_unit - Maximum amount in cents that can be paid with meal vouchers
 * @property meal_voucher_max_quantity - Maximum number of meal vouchers that can be used
 */
export type PaymentCreateBody = {
  flow: PaymentFlow
  currency: string
  callback_url?: string
  external_code?: string
  metadata?: Record<string, unknown>
  expiration_date?: string
  consumer_uid?: string
  required_success_email?: string
  pre_authorized_payments_token?: string
  meal_voucher_max_amount_unit?: number
  meal_voucher_max_quantity?: number
} & (
  | { amount: number; amount_unit?: never }
  | { amount?: never; amount_unit: number }
) & (
  | { flow: 'HOTP_AUTH' | 'PRE_AUTHORIZED' | 'PRE_AUTHORIZED_FUND_LOCK'; token: string }
  | { flow: 'REFUND'; parent_payment_uid: string }
  | { flow: 'MATCH_USER'; consumer_uid: string }
  | { flow: 'MATCH_CODE' | 'FUND_LOCK' }
)

/**
 * Payment update body
 * 
 * @property amount - Amount in euros (e.g., 10.50). Will be automatically converted to amount_unit.
 * @property amount_unit - Amount in cents (e.g., 1050). Use either 'amount' or 'amount_unit', not both.
 * @property meal_voucher_max_amount_unit - Maximum amount in cents that can be paid with meal vouchers
 * @property meal_voucher_max_quantity - Maximum number of meal vouchers that can be used
 */
export type PaymentUpdateBody = {
  action: PaymentAction
  meal_voucher_max_amount_unit?: number
  meal_voucher_max_quantity?: number
} & (
  | { amount?: number; amount_unit?: never }
  | { amount?: never; amount_unit?: number }
  | { amount?: never; amount_unit?: never }
)

/**
 * Pre-authorized payment token creation body
 */

export type PreAuthorizedPaymentTokenCreateBody = {
  reason?: string
  callback_url?: string
  redirect_url?: string
}

/**
 * Pre-authorized payment token update body
 */
export type PreAuthorizedPaymentTokenUpdateBody = {
  status?: PreAuthorizedTokenStatus
  consumer_uid?: string
  metadata?: string
}

/**
 * Payment response
 */
export type PaymentResponse = {
  id: string
  code_identifier: string
  type: PaymentType
  amount_unit: number
  currency: string
  status: PaymentStatus
  expired: boolean
  metadata?: Record<string, unknown>
  sender?: {
    id: string
    type: Actor
    name?: string
  }
  receiver?: {
    id: string
    type: Actor
  }
  insert_date?: string
  expire_date?: string
  external_code?: string
  daily_closure?: string
}

/**
 * Consumer interface
 */
export type Consumer = {
  id: string
  type: string
  name?: string
  phone_number?: string
}

/**
 * Daily closure detail
 */
export type DailyClosureDetail = {
  id: string
  type: string
  customer_uid: string
  gross_amount_unit: number
  refund_amount_unit: number
  amount_unit: number
  currency: string
}

/**
 * Daily closure response
 */
export type DailyClosure = {
  shop_daily_closure: DailyClosureDetail
  device_daily_closure: DailyClosureDetail
}

/**
 * Pre-authorized payment token interface
 */
export type PreAuthorizedPaymentResponse = {
  id: string
  token: string
  status: PreAuthorizedTokenStatus
  consumer_uid?: string
  expire_date?: string
  metadata?: Record<string, unknown>
}

/**
 * Query parameters for listing payments
 */
export type PaymentQueryParams = {
  limit?: number
  starting_after?: string
  starting_after_timestamp?: string | Date
  consumer_uid?: string
  payment_type?: string
  status?: PaymentStatus
  external_code?: string
  to_date?: string
  from_date?: string
}

/**
 * Query parameters for daily closure
 */
export type DailyClosureQueryParams = {
  limit?: number
  starting_after?: string
}

/**
 * Report creation body
 */
export type ReportCreateBody = {
  type: ReportType
  format?: ReportFormatType
  from_date: string
  to_date: string
  columns?: string[]
}

/**
 * Report response
 */
export type ReportResponse = {
  id: string
  type: ReportType
  format: ReportFormatType
  status: ReportStatus
  from_date: string
  to_date: string
  download_url?: string
  created_at: string
  updated_at: string
}

/**
 * Report list query parameters
 */
export type ReportListQueryParams = {
  limit?: number
  starting_after?: string
}

/**
 * Session creation body
 */
export type SessionCreateBody = {
  fund_lock_id: string
}

/**
 * Session response
 */
export type SessionResponse = {
  id: string
  amount_unit: number
  residual_amount_unit: number
  currency: string
  status: SessionStatus
  type: string
  consumer_uid?: string
  available?: boolean
  expiration_date?: string
}

/**
 * Session update body
 */
export type SessionUpdateBody = {
  status: SessionStatus
}

/**
 * Session event creation body
 */
export type SessionEventCreateBody = {
  operation: SessionEventOperation
  amount_unit: number
  currency: string
  description?: string
  metadata?: Record<string, unknown>
}
