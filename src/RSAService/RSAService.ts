import { RSAKeyPair } from '../types.js'

/**
 * Abstract RSA Service Contract
 */
export abstract class RSAService {
  /**
   * Verifies that this RSA implementation is available
   */
  abstract isAvailable(): boolean

  /**
   * Generate a pair of RSA keys
   */
  abstract generateKeys(): RSAKeyPair

  /**
   * Sign a string with the given private key
   * @param privateKey The private key used for signing
   * @param message The message that will be signed
   */
  abstract sign(privateKey: string, message: string): Buffer
}
