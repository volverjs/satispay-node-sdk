/**
 * Advanced Example: Payment Monitoring with Polling
 * 
 * This example demonstrates how to monitor payment status
 * with intelligent polling and timeout handling.
 */

import { Api, Payment } from '@volverjs/satispay-node-sdk'

// Configure API
Api.setEnv('staging')
Api.setKeyId('your-key-id')
Api.setPrivateKey('your-private-key')

/**
 * Payment status type
 */
type PaymentStatus = 'PENDING' | 'ACCEPTED' | 'CANCELED' | 'EXPIRED'

/**
 * Polling configuration
 */
interface PollingConfig {
	/** Initial polling interval in milliseconds */
	initialInterval: number
	/** Maximum polling interval in milliseconds */
	maxInterval: number
	/** Polling interval multiplier */
	intervalMultiplier: number
	/** Maximum total polling duration in milliseconds */
	timeout: number
}

const defaultPollingConfig: PollingConfig = {
	initialInterval: 2000, // 2 seconds
	maxInterval: 10000, // 10 seconds
	intervalMultiplier: 1.5,
	timeout: 300000, // 5 minutes
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Monitor payment until final status or timeout
 */
async function monitorPayment(
	paymentId: string,
	config: PollingConfig = defaultPollingConfig
): Promise<any> {
	const startTime = Date.now()
	let interval = config.initialInterval
	let lastStatus: PaymentStatus | null = null

	console.log(`Starting to monitor payment: ${paymentId}`)
	console.log(`Timeout: ${config.timeout / 1000}s`)

	while (true) {
		const elapsed = Date.now() - startTime

		// Check timeout
		if (elapsed >= config.timeout) {
			throw new Error(`Payment monitoring timed out after ${elapsed}ms`)
		}

		try {
			// Fetch payment status
			const payment = await Payment.get(paymentId)
			const currentStatus = payment.status as PaymentStatus

			// Log status change
			if (currentStatus !== lastStatus) {
				console.log(
					`[${new Date().toISOString()}] Status changed: ${lastStatus || 'INITIAL'} -> ${currentStatus}`
				)
				lastStatus = currentStatus
			}

			// Check if payment reached final status
			if (
				currentStatus === 'ACCEPTED' ||
				currentStatus === 'CANCELED' ||
				currentStatus === 'EXPIRED'
			) {
				console.log(`Payment reached final status: ${currentStatus}`)
				return payment
			}

			// Wait before next poll
			console.log(`Waiting ${interval / 1000}s before next poll...`)
			await sleep(interval)

			// Increase interval (exponential backoff)
			interval = Math.min(interval * config.intervalMultiplier, config.maxInterval)
		} catch (error) {
			console.error('Error fetching payment:', error)
			// Wait before retry
			await sleep(interval)
		}
	}
}

/**
 * Create and monitor payment
 */
async function createAndMonitorPayment(
	amount: number,
	description: string
): Promise<any> {
	// Create payment
	console.log('Creating payment...')
	const payment = await Payment.create({
		flow: 'MATCH_CODE',
		amount_unit: amount,
		currency: 'EUR',
		external_code: `ORDER-${Date.now()}`,
		metadata: {
			description,
			timestamp: new Date().toISOString(),
		},
	})

	console.log('Payment created:', {
		id: payment.id,
		status: payment.status,
		code_identifier: payment.code_identifier,
	})
	console.log(`\nPay with code: ${payment.code_identifier}\n`)

	// Monitor payment
	try {
		const finalPayment = await monitorPayment(payment.id, {
			initialInterval: 2000,
			maxInterval: 10000,
			intervalMultiplier: 1.5,
			timeout: 300000, // 5 minutes
		})

		console.log('\n=== Final Payment Status ===')
		console.log(`ID: ${finalPayment.id}`)
		console.log(`Status: ${finalPayment.status}`)
		console.log(`Amount: ${finalPayment.amount_unit / 100} EUR`)
		console.log(`Created: ${finalPayment.insert_date}`)
		console.log(`Updated: ${finalPayment.update_date}`)

		return finalPayment
	} catch (error) {
		console.error('\nError monitoring payment:', error)
		throw error
	}
}

/**
 * Monitor multiple payments concurrently
 */
async function monitorMultiplePayments(paymentIds: string[]): Promise<any[]> {
	console.log(`Monitoring ${paymentIds.length} payments concurrently...`)

	const promises = paymentIds.map((id) =>
		monitorPayment(id, {
			initialInterval: 3000,
			maxInterval: 15000,
			intervalMultiplier: 1.5,
			timeout: 300000,
		})
	)

	return Promise.all(promises)
}

/**
 * Example usage
 */
async function main() {
	try {
		// Example 1: Create and monitor single payment
		console.log('=== Example 1: Single Payment ===\n')
		const payment = await createAndMonitorPayment(
			1000, // 10.00 EUR
			'Test payment with monitoring'
		)

		console.log('\nPayment monitoring completed:', payment.status)
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}

// Run example
main()
