import * as crypto from 'crypto'
import { HttpMethod, RequestOptions } from './types.js'
import { RSAServiceFactory } from './RSAService/RSAServiceFactory.js'

/**
 * Request class for making HTTP requests to Satispay API
 * Uses native fetch API - compatible with Node.js 18+, Deno, and Bun
 */
export class Request {
  private static userAgentName = 'SatispayGBusinessApiNodeSdk'

  // Header constants
  static readonly HEADER_OS = 'x-satispay-os'
  static readonly HEADER_OS_VERSION = 'x-satispay-osv'
  static readonly HEADER_APP_VERSION = 'x-satispay-appv'
  static readonly HEADER_APP_NAME = 'x-satispay-appn'
  static readonly HEADER_DEVICE_TYPE = 'x-satispay-devicetype'
  static readonly HEADER_TRACKING_CODE = 'x-satispay-tracking-code'
  static readonly HEADER_IDEMPOTENCY_KEY = 'Idempotency-Key'

  /**
   * Make a GET request
   * @param path API endpoint path
   * @param options Request options
   */
  static async get<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({
      path,
      method: 'GET',
      ...options,
    })
  }

  /**
   * Make a POST request
   * @param path API endpoint path
   * @param options Request options
   */
  static async post<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({
      path,
      method: 'POST',
      ...options,
    })
  }

  /**
   * Make a PUT request
   * @param path API endpoint path
   * @param options Request options
   */
  static async put<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({
      path,
      method: 'PUT',
      ...options,
    })
  }

  /**
   * Make a PATCH request
   * @param path API endpoint path
   * @param options Request options
   */
  static async patch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>({
      path,
      method: 'PATCH',
      ...options,
    })
  }

  /**
   * Sign the request with RSA signature
   */
  private static signRequest(options: {
    method: HttpMethod
    path: string
    body: string
    authservicesUrl: string
    privateKey: string
    keyId: string
  }): Record<string, string> {
    const headers: Record<string, string> = {}

    const date = new Date().toUTCString()
    headers['Date'] = date

    const digest = Buffer.from(crypto.createHash('sha256').update(options.body).digest()).toString(
      'base64'
    )
    headers['Digest'] = `SHA-256=${digest}`

    let signature = `(request-target): ${options.method.toLowerCase()} ${options.path}\n`
    signature += `host: ${options.authservicesUrl.replace('https://', '')}\n`

    if (options.body) {
      signature += `content-type: application/json\n`
      signature += `content-length: ${Buffer.byteLength(options.body)}\n`
    }

    signature += `digest: SHA-256=${digest}\n`
    signature += `date: ${date}`

    const rsaService = RSAServiceFactory.get()
    const signedSignature = rsaService.sign(options.privateKey, signature)
    const base64SignedSignature = signedSignature.toString('base64')

    let signatureHeaders = '(request-target) host digest date'
    if (options.body) {
      signatureHeaders = '(request-target) host content-type content-length digest date'
    }

    headers['Authorization'] =
      `Signature keyId="${options.keyId}", algorithm="rsa-sha256", headers="${signatureHeaders}", signature="${base64SignedSignature}"`

    return headers
  }

  /**
   * Execute HTTP request using native fetch API
   * Compatible with Node.js 18+, Deno, and Bun
   */
  private static async request<T>(options: {
    path: string
    method: HttpMethod
    body?: unknown
    headers?: Record<string, string>
    sign?: boolean
  }): Promise<T> {
    // Import Api here to avoid circular dependency
    const { Api } = await import('./Api.js')

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': `${this.userAgentName}/${Api.getVersion()}`,
      ...options.headers,
    }

    // Add custom headers from Api
    const platformHeader = Api.getPlatformHeader()
    const platformVersionHeader = Api.getPlatformVersionHeader()
    const pluginVersionHeader = Api.getPluginVersionHeader()
    const pluginNameHeader = Api.getPluginNameHeader()
    const typeHeader = Api.getTypeHeader()
    const trackingHeader = Api.getTrackingHeader()

    if (platformHeader) headers[this.HEADER_OS] = platformHeader
    if (platformVersionHeader) headers[this.HEADER_OS_VERSION] = platformVersionHeader
    if (pluginVersionHeader) headers[this.HEADER_APP_VERSION] = pluginVersionHeader
    if (pluginNameHeader) headers[this.HEADER_APP_NAME] = pluginNameHeader
    if (typeHeader) headers[this.HEADER_DEVICE_TYPE] = typeHeader
    if (trackingHeader) headers[this.HEADER_TRACKING_CODE] = trackingHeader

    let body = ''
    if (options.body) {
      body = JSON.stringify(options.body)
      headers['Content-Type'] = 'application/json'
      headers['Content-Length'] = Buffer.byteLength(body).toString()
    }

    // Sign request if needed
    if (options.sign) {
      const privateKey = Api.getPrivateKey()
      const keyId = Api.getKeyId()

      if (privateKey && keyId) {
        const signHeaders = this.signRequest({
          method: options.method,
          path: options.path,
          body,
          authservicesUrl: Api.getAuthservicesUrl(),
          privateKey,
          keyId,
        })
        Object.assign(headers, signHeaders)
      }
    }

    const url = Api.getAuthservicesUrl() + options.path

    try {
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: options.method,
        headers,
      }

      // Add body for POST, PUT, PATCH
      if (body && options.method !== 'GET') {
        fetchOptions.body = body
      }

      // Disable SSL verification in staging mode (Node.js only)
      // Note: Deno and Bun don't support this directly via fetch
      if (Api.getEnv() === 'staging' && typeof process !== 'undefined' && process.versions?.node) {
        // For Node.js 18+ with fetch, we need to use a custom agent
        // This is a workaround for staging/test environments only
        const https = await import('https')
        const agent = new https.Agent({
          rejectUnauthorized: false,
        })
        // @ts-expect-error - agent is not in the standard fetch API but Node.js supports it
        fetchOptions.agent = agent
      }

      const response = await fetch(url, fetchOptions)

      // Read response body
      const responseText = await response.text()

      let parsedData: unknown
      try {
        parsedData = JSON.parse(responseText)
      } catch {
        parsedData = responseText
      }

      // Check response status
      const isResponseOk = response.status >= 200 && response.status <= 299

      if (!isResponseOk) {
        const errorData = parsedData as {
          message?: string
          code?: string
          wlt?: string
        }

        if (errorData?.message && errorData?.code && errorData?.wlt) {
          throw new Error(`${errorData.message}, request id: ${errorData.wlt}`)
        } else {
          throw new Error(`HTTP status is not 2xx: ${response.status}`)
        }
      }

      return parsedData as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Request failed: ${String(error)}`)
    }
  }
}
