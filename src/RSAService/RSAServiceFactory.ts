import { RSAServiceCrypto } from './RSAServiceCrypto.js'
import { RSAService } from './RSAService.js'

/**
 * Factory for creating RSA service instances
 */
export class RSAServiceFactory {
  private static instance: RSAService | null = null

  /**
   * Get an instance of the appropriate RSA service based on availability
   */
  static get(): RSAService {
    if (this.instance) {
      return this.instance
    }

    const service = new RSAServiceCrypto()
    if (service.isAvailable()) {
      this.instance = service
      return this.instance
    }

    throw new Error('No RSA service available.')
  }
}
