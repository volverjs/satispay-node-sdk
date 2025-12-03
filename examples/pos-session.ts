import { Api, Payment, Session } from '../src/index.js'

/**
 * Example: POS Session Management
 * 
 * Sessions allow managing fund lock payments incrementally,
 * useful for POS/device integrations where items are added over time.
 */

// Configure API
Api.setSandbox(true)
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY || '')
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY || '')
Api.setKeyId(process.env.SATISPAY_KEY_ID || '')

async function main() {
	try {
		console.log('🏪 POS Session Example\n')

		// Step 1: Create a fund lock payment
		console.log('1️⃣  Creating fund lock payment...\n')
		const fundLock = await Payment.create({
			flow: 'FUND_LOCK',
			amount: 100.00, // Lock 100 EUR
			currency: 'EUR',
			external_code: `POS-SESSION-${Date.now()}`,
		})

		console.log('✅ Fund lock created!')
		console.log('Payment ID:', fundLock.id)
		console.log('Amount locked:', fundLock.amount_unit / 100, 'EUR')
		console.log('Status:', fundLock.status)
		console.log('Code:', fundLock.code_identifier)
		console.log('\n💡 Customer needs to authorize this fund lock in their Satispay app.\n')
		
		// In a real scenario, wait for customer authorization via webhook or polling
		console.log('⏳ Waiting for customer authorization...')
		console.log('   (In production, use webhooks or poll Payment.get())\n')

		// For this example, we'll simulate that the payment is not yet authorized
		// In production, you would check the status until it becomes 'AUTHORIZED'
		const currentStatus = await Payment.get(fundLock.id)
		
		if (currentStatus.status !== 'AUTHORIZED') {
			console.log('⚠️  Payment not authorized yet.')
			console.log('   Status:', currentStatus.status)
			console.log('\n   To continue this example:')
			console.log('   1. Authorize the payment in Satispay app')
			console.log('   2. Wait for status to become AUTHORIZED')
			console.log('   3. Then run the session operations\n')
			
			console.log('   For this demo, we\'ll show how sessions work once authorized:\n')
		}

		// Step 2: Open a session (only works if fund lock is AUTHORIZED)
		console.log('2️⃣  Opening POS session...\n')
		console.log('   (This will fail until payment is AUTHORIZED)\n')
		
		try {
			const session = await Session.open({
				fund_lock_id: fundLock.id,
			})

			console.log('✅ Session opened!')
			console.log('Session ID:', session.id)
			console.log('Total amount:', session.amount_unit / 100, 'EUR')
			console.log('Residual amount:', session.residual_amount_unit / 100, 'EUR')
			console.log('Status:', session.status)

		// Step 3: Add items to the session
		console.log('\n3️⃣  Adding items to session...\n')

		// Add coffee
		await Session.createEvent(session.id, {
			operation: 'ADD',
			amount_unit: 300, // 3.00 EUR
			currency: 'EUR',
			description: 'Espresso',
			metadata: { sku: 'COFFEE-001', category: 'beverages' },
		})
		console.log('✅ Added: Espresso (3.00 EUR)')

		// Add croissant
		await Session.createEvent(session.id, {
			operation: 'ADD',
			amount_unit: 250, // 2.50 EUR
			currency: 'EUR',
			description: 'Croissant',
			metadata: { sku: 'PASTRY-042', category: 'food' },
		})
		console.log('✅ Added: Croissant (2.50 EUR)')

		// Add water
		await Session.createEvent(session.id, {
			operation: 'ADD',
			amount_unit: 150, // 1.50 EUR
			currency: 'EUR',
			description: 'Water',
			metadata: { sku: 'DRINK-010', category: 'beverages' },
		})
		console.log('✅ Added: Water (1.50 EUR)')

		// Apply discount
		console.log('\n4️⃣  Applying discount...\n')
		await Session.createEvent(session.id, {
			operation: 'REMOVE',
			amount_unit: 100, // -1.00 EUR discount
			currency: 'EUR',
			description: 'Happy Hour Discount',
		})
		console.log('✅ Applied discount: -1.00 EUR')			// Check session status
			console.log('\n5️⃣  Checking session status...\n')
			const sessionDetails = await Session.get(session.id)
			console.log('Total amount:', sessionDetails.amount_unit / 100, 'EUR')
			console.log('Amount charged:', (sessionDetails.amount_unit - sessionDetails.residual_amount_unit) / 100, 'EUR')
			console.log('Residual available:', sessionDetails.residual_amount_unit / 100, 'EUR')

			// Close the session
			console.log('\n6️⃣  Closing session...\n')
			const closedSession = await Session.update(session.id, {
				status: 'CLOSE',
			})

			console.log('✅ Session closed!')
			console.log('Final status:', closedSession.status)
			console.log('Final amount charged:', (closedSession.amount_unit - closedSession.residual_amount_unit) / 100, 'EUR')
			console.log('\n🎉 Transaction complete!')

		} catch (sessionError) {
			if (sessionError instanceof Error) {
				console.log('⚠️  Could not open session (expected if payment not authorized)')
				console.log('   Error:', sessionError.message)
				console.log('\n💡 Session Workflow:')
				console.log('   1. Create FUND_LOCK payment')
				console.log('   2. Customer authorizes in Satispay app')
				console.log('   3. Payment status becomes AUTHORIZED')
				console.log('   4. Open session with fund_lock_id')
				console.log('   5. Add/remove items with createEvent()')
				console.log('   6. Close session to finalize charge')
			}
		}

	} catch (error) {
		console.error('❌ Error:', error)
		
		if (error instanceof Error) {
			console.error('Message:', error.message)
		}
		
		process.exit(1)
	}
}

main()
