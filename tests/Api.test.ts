import { describe, it, expect, beforeEach } from 'vitest'
import { Api } from '../src/Api'
import type { Environment } from '../src/types'

describe('Api', () => {
	beforeEach(() => {
		// Reset to default state
		Api.setEnv('production')
	})

	describe('environment management', () => {
		it('should have production as default environment', () => {
			expect(Api.getEnv()).toBe('production')
		})

		it('should set and get environment correctly', () => {
			const environments: Environment[] = ['production', 'staging', 'test']

			environments.forEach((env) => {
				Api.setEnv(env)
				expect(Api.getEnv()).toBe(env)
			})
		})
	})

	describe('key management', () => {
		const mockPrivateKey = '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
		const mockPublicKey = '-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----'
		const mockKeyId = 'test-key-id'

		it('should set and get private key', () => {
			Api.setPrivateKey(mockPrivateKey)
			expect(Api.getPrivateKey()).toBe(mockPrivateKey)
		})

		it('should set and get public key', () => {
			Api.setPublicKey(mockPublicKey)
			expect(Api.getPublicKey()).toBe(mockPublicKey)
		})

		it('should set and get key ID', () => {
			Api.setKeyId(mockKeyId)
			expect(Api.getKeyId()).toBe(mockKeyId)
		})
	})

	describe('header management', () => {
		it('should set and get platform version header', () => {
			const version = '1.0.0'
			Api.setPlatformVersionHeader(version)
			expect(Api.getPlatformVersionHeader()).toBe(version)
		})

		it('should set and get platform header', () => {
			const platform = 'Node.js'
			Api.setPlatformHeader(platform)
			expect(Api.getPlatformHeader()).toBe(platform)
		})

		it('should set and get plugin version header', () => {
			const version = '2.0.0'
			Api.setPluginVersionHeader(version)
			expect(Api.getPluginVersionHeader()).toBe(version)
		})

		it('should set and get plugin name header', () => {
			const name = 'my-plugin'
			Api.setPluginNameHeader(name)
			expect(Api.getPluginNameHeader()).toBe(name)
		})

		it('should set and get type header', () => {
			const type = 'POS'
			Api.setTypeHeader(type)
			expect(Api.getTypeHeader()).toBe(type)
		})

		it('should set and get tracking header', () => {
			const tracking = 'tracking-code-123'
			Api.setTrackingHeader(tracking)
			expect(Api.getTrackingHeader()).toBe(tracking)
		})
	})

	describe('getVersion', () => {
		it('should return SDK version', () => {
			const version = Api.getVersion()
			expect(version).toBeTruthy()
			expect(typeof version).toBe('string')
			expect(version).toMatch(/^\d+\.\d+\.\d+$/)
		})
	})
})
