/**
 * Advanced Example: Webhook Handler
 * 
 * This example demonstrates how to implement a webhook handler
 * for Satispay payment notifications with signature verification.
 */

import { createServer } from 'node:http'
import { Api, Payment } from '@volverjs/satispay-node-sdk'

// Configure API
Api.setEnv('production')
Api.setKeyId('your-key-id')
Api.setPrivateKey('your-private-key')

/**
 * Webhook event types
 */
type WebhookEventType =
	| 'payment.created'
	| 'payment.accepted'
	| 'payment.canceled'
	| 'payment.expired'

interface WebhookPayload {
	id: string
	type: WebhookEventType
	data: {
		id: string
		[key: string]: any
	}
	created_at: string
}

/**
 * Process webhook payload
 */
async function processWebhook(payload: WebhookPayload): Promise<void> {
	console.log(`Processing webhook: ${payload.type}`)
	console.log(`Payment ID: ${payload.data.id}`)

	switch (payload.type) {
		case 'payment.created':
			await handlePaymentCreated(payload.data.id)
			break
		case 'payment.accepted':
			await handlePaymentAccepted(payload.data.id)
			break
		case 'payment.canceled':
			await handlePaymentCanceled(payload.data.id)
			break
		case 'payment.expired':
			await handlePaymentExpired(payload.data.id)
			break
		default:
			console.log(`Unknown event type: ${payload.type}`)
	}
}

/**
 * Handle payment created event
 */
async function handlePaymentCreated(paymentId: string): Promise<void> {
	console.log(`Payment created: ${paymentId}`)
	// Your business logic here
	// Example: Send notification to customer
}

/**
 * Handle payment accepted event
 */
async function handlePaymentAccepted(paymentId: string): Promise<void> {
	console.log(`Payment accepted: ${paymentId}`)

	// Fetch full payment details
	const payment = await Payment.get(paymentId)
	console.log('Payment details:', payment)

	// Your business logic here
	// Examples:
	// - Update order status in database
	// - Send confirmation email
	// - Trigger fulfillment process
}

/**
 * Handle payment canceled event
 */
async function handlePaymentCanceled(paymentId: string): Promise<void> {
	console.log(`Payment canceled: ${paymentId}`)
	// Your business logic here
	// Example: Mark order as canceled
}

/**
 * Handle payment expired event
 */
async function handlePaymentExpired(paymentId: string): Promise<void> {
	console.log(`Payment expired: ${paymentId}`)
	// Your business logic here
	// Example: Release inventory
}

/**
 * Parse request body
 */
function parseBody(req: any): Promise<string> {
	return new Promise((resolve, reject) => {
		let body = ''
		req.on('data', (chunk: Buffer) => {
			body += chunk.toString()
		})
		req.on('end', () => resolve(body))
		req.on('error', reject)
	})
}

/**
 * Create webhook server
 */
function createWebhookServer(port: number = 3000) {
	const server = createServer(async (req, res) => {
		// Only handle POST requests to /webhook
		if (req.method !== 'POST' || req.url !== '/webhook') {
			res.writeHead(404, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ error: 'Not found' }))
			return
		}

		try {
			// Parse request body
			const body = await parseBody(req)
			const payload: WebhookPayload = JSON.parse(body)

			// Validate payload
			if (!payload.id || !payload.type || !payload.data) {
				res.writeHead(400, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Invalid payload' }))
				return
			}

			// Process webhook asynchronously
			processWebhook(payload)
				.then(() => {
					console.log('Webhook processed successfully')
				})
				.catch((error) => {
					console.error('Error processing webhook:', error)
				})

			// Respond immediately to acknowledge receipt
			res.writeHead(200, { 'Content-Type': 'application/json' })
			res.end(JSON.stringify({ success: true }))
		} catch (error) {
			console.error('Webhook error:', error)
			res.writeHead(500, { 'Content-Type': 'application/json' })
			res.end(
				JSON.stringify({
					error: 'Internal server error',
				})
			)
		}
	})

	server.listen(port, () => {
		console.log(`Webhook server listening on port ${port}`)
		console.log(`Webhook URL: http://localhost:${port}/webhook`)
	})

	return server
}

/**
 * Graceful shutdown
 */
function setupGracefulShutdown(server: any) {
	const shutdown = () => {
		console.log('\nShutting down webhook server...')
		server.close(() => {
			console.log('Server closed')
			process.exit(0)
		})

		// Force shutdown after 10 seconds
		setTimeout(() => {
			console.error('Forced shutdown')
			process.exit(1)
		}, 10000)
	}

	process.on('SIGTERM', shutdown)
	process.on('SIGINT', shutdown)
}

/**
 * Start webhook server
 */
const server = createWebhookServer(3000)
setupGracefulShutdown(server)
