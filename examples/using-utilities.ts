/**
 * Example: Using Utility Functions
 * 
 * This example demonstrates how to use the utility functions
 * provided by the SDK for common operations.
 */

import {
	Api,
	Payment,
	Amount,
	DateUtils,
	Validation,
	CodeGenerator,
	PaymentStatusUtils,
} from '@volverjs/satispay-node-sdk'

// Configure API
Api.setEnv('staging')
Api.setKeyId('your-key-id')
Api.setPrivateKey('your-private-key')

/**
 * Example 1: Amount utilities
 */
function amountUtilitiesExample() {
	console.log('=== Amount Utilities ===\n')

	// Convert euros to cents
	const euros = 10.5
	const cents = Amount.toCents(euros)
	console.log(`${euros} EUR = ${cents} cents`)

	// Convert cents to euros
	console.log(`${cents} cents = ${Amount.toEuros(cents)} EUR`)

	// Format amount for display
	console.log(`Formatted: ${Amount.format(cents)}`)
	console.log(`Formatted (en-US): ${Amount.format(cents, 'en-US')}`)

	// Parse formatted amount
	const parsed = Amount.parse('10,50 €')
	console.log(`Parsed "10,50 €" = ${parsed} cents`)

	// Validate amount
	console.log(`Is 1000 cents valid? ${Amount.isValid(1000)}`)
	console.log(`Is -100 cents valid? ${Amount.isValid(-100)}`)
	console.log(`Is 10.5 cents valid? ${Amount.isValid(10.5)}`)
}

/**
 * Example 2: Date utilities
 */
function dateUtilitiesExample() {
	console.log('\n=== Date Utilities ===\n')

	const now = new Date()

	// Format date for API
	console.log(`API format: ${DateUtils.formatForApi(now)}`)

	// Get today and yesterday
	console.log(`Today: ${DateUtils.getToday()}`)
	console.log(`Yesterday: ${DateUtils.getYesterday()}`)

	// Check if date is today
	console.log(`Is now today? ${DateUtils.isToday(now)}`)

	// Format dates for display
	console.log(`Formatted: ${DateUtils.format(now)}`)
	console.log(`Formatted (en-US): ${DateUtils.format(now, 'en-US')}`)
	console.log(`DateTime: ${DateUtils.formatDateTime(now)}`)

	// Get daily closure range
	const range = DateUtils.getDailyClosureRange(now)
	console.log(`Daily closure range:`)
	console.log(`  Start: ${range.start}`)
	console.log(`  End: ${range.end}`)
}

/**
 * Example 3: Validation utilities
 */
function validationUtilitiesExample() {
	console.log('\n=== Validation Utilities ===\n')

	// Validate external code
	const validCode = 'ORDER-123'
	const invalidCode = 'Invalid Code!'
	console.log(
		`"${validCode}" is valid? ${Validation.validateExternalCode(validCode)}`
	)
	console.log(
		`"${invalidCode}" is valid? ${Validation.validateExternalCode(invalidCode)}`
	)

	// Validate flow
	console.log(`"MATCH_CODE" is valid flow? ${Validation.validateFlow('MATCH_CODE')}`)
	console.log(`"INVALID" is valid flow? ${Validation.validateFlow('INVALID')}`)

	// Validate currency
	console.log(`"EUR" is valid currency? ${Validation.validateCurrency('EUR')}`)
	console.log(`"USD" is valid currency? ${Validation.validateCurrency('USD')}`)

	// Validate phone
	const validPhone = '+393331234567'
	const invalidPhone = '123456'
	console.log(`"${validPhone}" is valid? ${Validation.validatePhone(validPhone)}`)
	console.log(
		`"${invalidPhone}" is valid? ${Validation.validatePhone(invalidPhone)}`
	)

	// Validate metadata
	const validMetadata = { orderId: '123', customer: 'John' }
	const invalidMetadata = { data: 'x'.repeat(1000) }
	console.log(`Valid metadata? ${Validation.validateMetadata(validMetadata)}`)
	console.log(`Invalid metadata? ${Validation.validateMetadata(invalidMetadata)}`)
}

/**
 * Example 4: Code generator utilities
 */
function codeGeneratorExample() {
	console.log('\n=== Code Generator ===\n')

	// Generate external codes
	console.log(`Timestamp code: ${CodeGenerator.generateExternalCode()}`)
	console.log(`Random code: ${CodeGenerator.generateRandomExternalCode()}`)
	console.log(`UUID code: ${CodeGenerator.generateUuidExternalCode()}`)

	// With custom prefix
	console.log(`Custom prefix: ${CodeGenerator.generateExternalCode('INVOICE')}`)
}

/**
 * Example 5: Payment status utilities
 */
function paymentStatusExample() {
	console.log('\n=== Payment Status ===\n')

	const statuses = ['PENDING', 'ACCEPTED', 'CANCELED', 'EXPIRED']

	statuses.forEach((status) => {
		console.log(`\nStatus: ${status}`)
		console.log(`  Is pending? ${PaymentStatusUtils.isPending(status)}`)
		console.log(`  Is accepted? ${PaymentStatusUtils.isAccepted(status)}`)
		console.log(`  Is final? ${PaymentStatusUtils.isFinal(status)}`)
		console.log(`  Label (IT): ${PaymentStatusUtils.getLabel(status, 'it-IT')}`)
		console.log(`  Label (EN): ${PaymentStatusUtils.getLabel(status, 'en-US')}`)
	})
}

/**
 * Example 6: Real-world payment creation with utilities
 */
async function createPaymentWithUtilities() {
	console.log('\n=== Create Payment with Utilities ===\n')

	try {
		// Generate external code
		const externalCode = CodeGenerator.generateExternalCode()
		console.log(`Generated external code: ${externalCode}`)

		// Validate external code
		const codeValidation = Validation.validateExternalCode(externalCode)
		if (codeValidation !== true) {
			throw new Error(`Invalid external code: ${codeValidation}`)
		}

		// Convert amount
		const euros = 12.99
		const cents = Amount.toCents(euros)
		console.log(`Amount: ${Amount.format(cents)}`)

		// Create payment
		const payment = await Payment.create({
			flow: 'MATCH_CODE',
			amount_unit: cents,
			currency: 'EUR',
			external_code: externalCode,
			metadata: {
				description: 'Test payment',
				timestamp: DateUtils.formatForApi(new Date()),
			},
		})

		console.log('\nPayment created:')
		console.log(`  ID: ${payment.id}`)
		console.log(`  Status: ${PaymentStatusUtils.getLabel(payment.status)}`)
		console.log(`  Code: ${payment.code_identifier}`)
		console.log(`  Amount: ${Amount.format(payment.amount_unit)}`)

		return payment
	} catch (error) {
		console.error('Error creating payment:', error)
		throw error
	}
}

/**
 * Run all examples
 */
async function main() {
	try {
		amountUtilitiesExample()
		dateUtilitiesExample()
		validationUtilitiesExample()
		codeGeneratorExample()
		paymentStatusExample()

		// Uncomment to create real payment
		// await createPaymentWithUtilities()
	} catch (error) {
		console.error('Error:', error)
		process.exit(1)
	}
}

// Run examples
main()
