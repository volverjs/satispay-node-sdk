import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Request } from '../src/Request'
import { Api } from '../src/Api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('Request', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		Api.setEnv('test')
		Api.setPrivateKey(
			'-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----'
		)
		Api.setPublicKey('-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----')
		Api.setKeyId('test-key-id')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('HTTP Methods', () => {
		it('should make a GET request', async () => {
			const mockResponse = { data: 'test' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			const result = await Request.get('/test/path')

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/test/path'),
				expect.objectContaining({
					method: 'GET',
				})
			)
			expect(result).toEqual(mockResponse)
		})

		it('should make a POST request', async () => {
			const mockResponse = { created: true }
			const postData = { name: 'test' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 201,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			const result = await Request.post('/test/path', { body: postData })

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/test/path'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(postData),
				})
			)
			expect(result).toEqual(mockResponse)
		})

		it('should make a PUT request', async () => {
			const mockResponse = { updated: true }
			const putData = { name: 'updated' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			const result = await Request.put('/test/path', { body: putData })

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/test/path'),
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(putData),
				})
			)
			expect(result).toEqual(mockResponse)
		})

		it('should make a PATCH request', async () => {
			const mockResponse = { patched: true }
			const patchData = { field: 'value' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			const result = await Request.patch('/test/path', { body: patchData })

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/test/path'),
				expect.objectContaining({
					method: 'PATCH',
					body: JSON.stringify(patchData),
				})
			)
			expect(result).toEqual(mockResponse)
		})
	})

	describe('Headers', () => {
		it('should include custom headers', async () => {
			const mockResponse = { success: true }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			const customHeaders = {
				'X-Custom-Header': 'custom-value',
			}

			await Request.get('/test/path', { headers: customHeaders })

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining(customHeaders),
				})
			)
		})

		it('should not include authentication headers when not signing', async () => {
			const mockResponse = { success: true }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			await Request.get('/test/path', { sign: false })

			const fetchCall = mockFetch.mock.calls[0]
			const headers = fetchCall[1].headers

			expect(headers).not.toHaveProperty('Digest')
			expect(headers).not.toHaveProperty('Authorization')
		})
	})

	describe('Error Handling', () => {
		it('should throw error on 4xx response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
				text: async () =>
					JSON.stringify({ message: 'Not found', code: 'NOT_FOUND' }),
				json: async () => ({ message: 'Not found', code: 'NOT_FOUND' }),
				headers: new Headers(),
			})

			await expect(Request.get('/test/path')).rejects.toThrow()
		})

		it('should throw error on 5xx response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 500,
				text: async () =>
					JSON.stringify({ message: 'Server error', code: 'SERVER_ERROR' }),
				json: async () => ({ message: 'Server error', code: 'SERVER_ERROR' }),
				headers: new Headers(),
			})

			await expect(Request.get('/test/path')).rejects.toThrow()
		})

		it('should throw error on network failure', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'))

			await expect(Request.get('/test/path')).rejects.toThrow('Network error')
		})

		it('should handle non-JSON responses', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => 'Plain text response',
				json: async () => {
					throw new Error('Invalid JSON')
				},
				headers: new Headers(),
			})

			// Request.ts handles plain text by returning it as-is when JSON parsing fails
			const result = await Request.get('/test/path')
			expect(result).toBe('Plain text response')
		})
	})

	describe('Request Body', () => {
		it('should not include body for GET requests', async () => {
			const mockResponse = { data: 'test' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			await Request.get('/test/path')

			const fetchCall = mockFetch.mock.calls[0]
			expect(fetchCall[1].body).toBeUndefined()
		})

		it('should serialize body as JSON for POST', async () => {
			const mockResponse = { success: true }
			const body = { key: 'value' }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			await Request.post('/test/path', { body })

			const fetchCall = mockFetch.mock.calls[0]
			expect(fetchCall[1].body).toBe(JSON.stringify(body))
		})

		it('should handle empty body', async () => {
			const mockResponse = { success: true }
			mockFetch.mockResolvedValue({
				ok: true,
				status: 200,
				text: async () => JSON.stringify(mockResponse),
				json: async () => mockResponse,
				headers: new Headers(),
			})

			await Request.post('/test/path')

			const fetchCall = mockFetch.mock.calls[0]
			expect(fetchCall[1].body).toBeUndefined()
		})
	})
})
