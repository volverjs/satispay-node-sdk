import * as crypto from 'crypto'
import { RSAService } from './RSAService.js'
import { RSAKeyPair } from '../types.js'

/**
 * RSA Service implemented via Node.js crypto module
 */
export class RSAServiceCrypto extends RSAService {
  /**
   * Check if Node.js crypto module is available
   */
  isAvailable(): boolean {
    try {
      return typeof crypto.generateKeyPairSync === 'function'
    } catch {
      return false
    }
  }

  /**
   * Generate a pair of RSA keys
   */
  generateKeys(): RSAKeyPair {
    try {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      })

      return {
        privateKey,
        publicKey,
      }
    } catch (error) {
      throw new Error(
        `Failed to generate RSA keys: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Sign a message with the given private key
   * @param privateKey The private key used for signing
   * @param message The message that will be signed
   */
  sign(privateKey: string, message: string): Buffer {
    try {
      const sign = crypto.createSign('RSA-SHA256')
      sign.update(message)
      sign.end()
      return sign.sign(privateKey)
    } catch (error) {
      throw new Error(`Signing failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
