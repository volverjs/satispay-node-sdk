import { describe, it, expect } from 'vitest'
import { RSAServiceCrypto } from '../src/RSAService/RSAServiceCrypto'

describe('RSAServiceCrypto', () => {
	const rsaService = new RSAServiceCrypto()

	describe('isAvailable', () => {
		it('should return true in Node.js environment', () => {
			expect(rsaService.isAvailable()).toBe(true)
		})
	})

	describe('generateKeys', () => {
		it('should generate a valid RSA key pair', () => {
			const keys = rsaService.generateKeys()

			expect(keys).toHaveProperty('privateKey')
			expect(keys).toHaveProperty('publicKey')
			expect(keys.privateKey).toContain('BEGIN PRIVATE KEY')
			expect(keys.privateKey).toContain('END PRIVATE KEY')
			expect(keys.publicKey).toContain('BEGIN PUBLIC KEY')
			expect(keys.publicKey).toContain('END PUBLIC KEY')
		})

		it('should generate different keys each time', () => {
			const keys1 = rsaService.generateKeys()
			const keys2 = rsaService.generateKeys()

			expect(keys1.privateKey).not.toBe(keys2.privateKey)
			expect(keys1.publicKey).not.toBe(keys2.publicKey)
		})
	})

	describe('sign', () => {
		it('should sign a message with private key', () => {
			const keys = rsaService.generateKeys()
			const message = 'test message'

			const signature = rsaService.sign(keys.privateKey, message)

			expect(signature).toBeTruthy()
			expect(signature).toBeInstanceOf(Buffer)
			expect(signature.length).toBeGreaterThan(0)
		})

		it('should produce different signatures for different messages', () => {
			const keys = rsaService.generateKeys()
			const message1 = 'test message 1'
			const message2 = 'test message 2'

			const signature1 = rsaService.sign(keys.privateKey, message1)
			const signature2 = rsaService.sign(keys.privateKey, message2)

			expect(signature1).not.toBe(signature2)
		})

		it('should produce the same signature for the same message', () => {
			const keys = rsaService.generateKeys()
			const message = 'test message'

			const signature1 = rsaService.sign(keys.privateKey, message)
			const signature2 = rsaService.sign(keys.privateKey, message)

			expect(signature1).toStrictEqual(signature2)
		})

		it('should throw error with invalid private key', () => {
			expect(() => {
				rsaService.sign('invalid-key', 'message')
			}).toThrow()
		})

		it('should return a Buffer', () => {
			const keys = rsaService.generateKeys()
			const signature = rsaService.sign(keys.privateKey, 'test')

			expect(signature).toBeInstanceOf(Buffer)
		})
	})
})
