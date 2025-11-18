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
export type Environment = 'production' | 'staging' | 'test'

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
 */
export type PaymentCreateBody = {
  flow: PaymentFlow
  amount_unit: number
  currency: string
  callback_url?: string
  external_code?: string
  metadata?: Record<string, unknown>
  expiration_date?: string
  consumer_uid?: string
  required_success_email?: string
  pre_authorized_payments_token?: string
} & (
  | { flow: 'HOTP_AUTH' | 'PRE_AUTHORIZED' | 'PRE_AUTHORIZED_FUND_LOCK'; token: string }
  | { flow: 'REFUND'; parent_payment_uid: string }
  | { flow: 'MATCH_USER'; consumer_uid: string }
  | { flow: 'MATCH_CODE' | 'FUND_LOCK' }
)

/**
 * Payment update body
 */
export type PaymentUpdateBody = {
  action: PaymentAction
  amount_unit?: number
}

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
 * Daily closure interface
 */
export type DailyClosure = {
  date: string
  total_amount_unit: number
  currency: string
  payments_count: number
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
  starting_after_timestamp?: string
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
