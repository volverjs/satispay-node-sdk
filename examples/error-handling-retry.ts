/**
 * Advanced Example: Error Handling with Retry Logic
 * 
 * This example demonstrates how to implement robust error handling
 * with exponential backoff retry logic for API calls.
 */

import { Api, Payment } from '@volverjs/satispay-node-sdk'

// Configure API
Api.setEnv('production')
Api.setKeyId('your-key-id')
Api.setPrivateKey('your-private-key')

/**
 * Retry configuration
 */
interface RetryConfig {
	maxRetries: number
	initialDelay: number
	maxDelay: number
	backoffMultiplier: number
}

const defaultRetryConfig: RetryConfig = {
	maxRetries: 3,
	initialDelay: 1000, // 1 second
	maxDelay: 10000, // 10 seconds
	backoffMultiplier: 2,
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	config: RetryConfig = defaultRetryConfig
): Promise<T> {
	let lastError: Error | undefined
	let delay = config.initialDelay

	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error
			
			// Don't retry on client errors (4xx)
			if (error instanceof Error && error.message.includes('400')) {
				throw error
			}

			if (attempt < config.maxRetries) {
				console.log(
					`Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${delay}ms...`
				)
				await sleep(delay)
				delay = Math.min(delay * config.backoffMultiplier, config.maxDelay)
			}
		}
	}

	throw new Error(
		`Max retries (${config.maxRetries}) exceeded. Last error: ${lastError?.message}`
	)
}

/**
 * Create payment with retry logic
 */
async function createPaymentWithRetry(
	amount: number,
	description: string
): Promise<any> {
	return retryWithBackoff(async () => {
		return await Payment.create({
			flow: 'MATCH_CODE',
			amount_unit: amount,
			currency: 'EUR',
			external_code: `ORDER-${Date.now()}`,
			metadata: {
				description,
				timestamp: new Date().toISOString(),
			},
		})
	})
}

/**
 * Get payment with retry logic
 */
async function getPaymentWithRetry(paymentId: string): Promise<any> {
	return retryWithBackoff(async () => {
		return await Payment.get(paymentId)
	})
}

/**
 * Example usage
 */
async function main() {
	try {
		// Create payment with automatic retries
		console.log('Creating payment with retry logic...')
		const payment = await createPaymentWithRetry(
			1000, // 10.00 EUR
			'Test payment with retry logic'
		)
		console.log('Payment created:', payment)

		// Get payment with automatic retries
		console.log('\nGetting payment with retry logic...')
		const fetchedPayment = await getPaymentWithRetry(payment.id)
		console.log('Payment retrieved:', fetchedPayment)
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}

// Run example
main()
