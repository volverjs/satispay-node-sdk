import { describe, it, expect } from 'vitest'
import { RSAServiceFactory } from '../src/RSAService/RSAServiceFactory'
import { RSAServiceCrypto } from '../src/RSAService/RSAServiceCrypto'

describe('RSAServiceFactory', () => {
	describe('get', () => {
		it('should return an RSA service instance', () => {
			const service = RSAServiceFactory.get()

			expect(service).toBeDefined()
			expect(service).toBeInstanceOf(RSAServiceCrypto)
		})

		it('should return the same instance on multiple calls', () => {
			const service1 = RSAServiceFactory.get()
			const service2 = RSAServiceFactory.get()

			expect(service1).toBe(service2)
		})

		it('should return a service that can generate keys', () => {
			const service = RSAServiceFactory.get()
			const keys = service.generateKeys()

			expect(keys).toHaveProperty('privateKey')
			expect(keys).toHaveProperty('publicKey')
		})
	})
})
