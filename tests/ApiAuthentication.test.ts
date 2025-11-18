import { describe, it, expect } from 'vitest'
import { ApiAuthentication } from '../src/ApiAuthentication'

describe('ApiAuthentication', () => {
	const mockPrivateKey = '-----BEGIN PRIVATE KEY-----\ntest-private\n-----END PRIVATE KEY-----'
	const mockPublicKey = '-----BEGIN PUBLIC KEY-----\ntest-public\n-----END PUBLIC KEY-----'
	const mockKeyId = 'test-key-id-123'

	describe('constructor', () => {
		it('should create an instance with provided keys', () => {
			const auth = new ApiAuthentication(mockPrivateKey, mockPublicKey, mockKeyId)

			expect(auth).toBeInstanceOf(ApiAuthentication)
			expect(auth.privateKey).toBe(mockPrivateKey)
			expect(auth.publicKey).toBe(mockPublicKey)
			expect(auth.keyId).toBe(mockKeyId)
		})
	})

	describe('properties', () => {
		it('should return the private key', () => {
			const auth = new ApiAuthentication(mockPrivateKey, mockPublicKey, mockKeyId)
			expect(auth.privateKey).toBe(mockPrivateKey)
		})

		it('should return the public key', () => {
			const auth = new ApiAuthentication(mockPrivateKey, mockPublicKey, mockKeyId)
			expect(auth.publicKey).toBe(mockPublicKey)
		})

		it('should return the key ID', () => {
			const auth = new ApiAuthentication(mockPrivateKey, mockPublicKey, mockKeyId)
			expect(auth.keyId).toBe(mockKeyId)
		})
	})

	describe('multiple instances', () => {
		it('should maintain separate state for different instances', () => {
			const auth1 = new ApiAuthentication(mockPrivateKey, mockPublicKey, 'key-id-1')
			const auth2 = new ApiAuthentication('other-private', 'other-public', 'key-id-2')

			expect(auth1.keyId).toBe('key-id-1')
			expect(auth2.keyId).toBe('key-id-2')
			expect(auth1.privateKey).not.toBe(auth2.privateKey)
		})
	})
})
