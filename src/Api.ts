import type { Environment } from './types.js'
import { Request } from './Request.js'
import { RSAServiceFactory } from './RSAService/RSAServiceFactory.js'
import { ApiAuthentication } from './ApiAuthentication.js'

/**
 * Main API class for Satispay GBusiness SDK
 * 
 * This class manages global configuration for the SDK including:
 * - Environment (staging/production)
 * - Authentication keys (public key, private key, key ID)
 * - Custom platform headers
 * 
 * All configuration is static and applies to all API calls.
 * 
 * @example
 * ```typescript
 * import { Api, Payment } from '@volverjs/satispay-node-sdk'
 * 
 * // Option 1: Authenticate with activation token
 * const auth = await Api.authenticateWithToken('your-token-from-dashboard')
 * console.log(`Key ID: ${auth.keyId}`)
 * 
 * // Option 2: Use existing keys
 * Api.setEnv('production')
 * Api.setKeyId('your-key-id')
 * Api.setPrivateKey('-----BEGIN PRIVATE KEY-----\\n...')
 * Api.setPublicKey('-----BEGIN PUBLIC KEY-----\\n...')
 * 
 * // Set platform identification (optional)
 * Api.setPlatformHeader('MyPlatform/1.0.0')
 * 
 * // Now you can use the API
 * const payment = await Payment.create({ ... })
 * ```
 */
export class Api {
  private static env: Environment = 'production'
  private static privateKey: string | null = null
  private static publicKey: string | null = null
  private static keyId: string | null = null
  private static version = '1.4.1'
  private static authservicesUrl = 'https://authservices.satispay.com'
  private static platformVersionHeader: string | null = null
  private static platformHeader: string | null = null
  private static pluginVersionHeader: string | null = null
  private static pluginNameHeader: string | null = null
  private static typeHeader: string | null = null
  private static trackingHeader: string | null = null

  /**
   * Generate new keys and authenticate with token
   * @param token Activation token from Satispay dashboard
   */
  static async authenticateWithToken(token: string): Promise<ApiAuthentication> {
    const rsaService = RSAServiceFactory.get()
    const rsaKeys = rsaService.generateKeys()

    const generatedPrivateKey = rsaKeys.privateKey
    const generatedPublicKey = rsaKeys.publicKey

    const requestResult = await Request.post<{ key_id: string }>(
      '/g_business/v1/authentication_keys',
      {
        body: {
          public_key: generatedPublicKey,
          token: token,
        },
      }
    )

    this.privateKey = generatedPrivateKey
    this.publicKey = generatedPublicKey
    this.keyId = requestResult.key_id

    return new ApiAuthentication(generatedPrivateKey, generatedPublicKey, requestResult.key_id)
  }

  /**
   * Get the current environment
   */
  static getEnv(): Environment {
    return this.env
  }

  /**
   * Set the current environment
   */
  static setEnv(value: Environment): void {
    this.env = value

    if (value === 'production') {
      this.authservicesUrl = 'https://authservices.satispay.com'
      return
    }
    this.authservicesUrl = `https://${value}.authservices.satispay.com`
  }

  /**
   * Get platform version header
   */
  static getPlatformVersionHeader(): string | null {
    return this.platformVersionHeader
  }

  /**
   * Set platform version header
   */
  static setPlatformVersionHeader(value: string): void {
    this.platformVersionHeader = value
  }

  /**
   * Get platform header
   */
  static getPlatformHeader(): string | null {
    return this.platformHeader
  }

  /**
   * Set platform header
   */
  static setPlatformHeader(value: string): void {
    this.platformHeader = value
  }

  /**
   * Get plugin version header
   */
  static getPluginVersionHeader(): string | null {
    return this.pluginVersionHeader
  }

  /**
   * Set plugin version header
   */
  static setPluginVersionHeader(value: string): void {
    this.pluginVersionHeader = value
  }

  /**
   * Get plugin name header
   */
  static getPluginNameHeader(): string | null {
    return this.pluginNameHeader
  }

  /**
   * Set plugin name header
   */
  static setPluginNameHeader(value: string): void {
    this.pluginNameHeader = value
  }

  /**
   * Get type header
   */
  static getTypeHeader(): string | null {
    return this.typeHeader
  }

  /**
   * Set type header
   */
  static setTypeHeader(value: string): void {
    this.typeHeader = value
  }

  /**
   * Get tracking header
   */
  static getTrackingHeader(): string | null {
    return this.trackingHeader
  }

  /**
   * Set tracking header
   */
  static setTrackingHeader(value: string): void {
    this.trackingHeader = value
  }

  /**
   * Get private key
   */
  static getPrivateKey(): string | null {
    return this.privateKey
  }

  /**
   * Set the private key
   */
  static setPrivateKey(value: string): void {
    this.privateKey = value
  }

  /**
   * Get public key
   */
  static getPublicKey(): string | null {
    return this.publicKey
  }

  /**
   * Set the public key
   */
  static setPublicKey(value: string): void {
    this.publicKey = value
  }

  /**
   * Get the current KeyId
   */
  static getKeyId(): string | null {
    return this.keyId
  }

  /**
   * Set the KeyId
   */
  static setKeyId(value: string): void {
    this.keyId = value
  }

  /**
   * Get version
   */
  static getVersion(): string {
    return this.version
  }

  /**
   * Get authservices url
   */
  static getAuthservicesUrl(): string {
    return this.authservicesUrl
  }

  /**
   * Is sandbox enabled?
   */
  static getSandbox(): boolean {
    return this.env === 'staging'
  }

  /**
   * Enable or disable sandbox
   */
  static setSandbox(value = true): void {
    this.setEnv(value ? 'staging' : 'production')
  }
}
