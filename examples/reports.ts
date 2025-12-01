import { Api, Report } from '../src/index.js'

/**
 * Example: Create and manage reports
 * 
 * ⚠️ IMPORTANT: Report APIs require special authentication keys.
 * Contact tech@satispay.com to enable report access for your account.
 */

// Configure API
Api.setSandbox(true)
Api.setPublicKey(process.env.SATISPAY_PUBLIC_KEY || '')
Api.setPrivateKey(process.env.SATISPAY_PRIVATE_KEY || '')
Api.setKeyId(process.env.SATISPAY_KEY_ID || '')

async function main() {
	try {
		console.log('📊 Creating a new report...\n')

		// Create a new report for the last month
		const today = new Date()
		const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
		const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

		const report = await Report.create({
			type: 'PAYMENT_FEE',
			format: 'CSV',
			from_date: lastMonth.toISOString().split('T')[0],
			to_date: lastMonthEnd.toISOString().split('T')[0],
			columns: [
				'transaction_id',
				'transaction_date',
				'total_amount',
				'fee_amount',
				'transaction_type',
				'external_code',
			],
		})

		console.log('✅ Report created successfully!')
		console.log('Report ID:', report.id)
		console.log('Status:', report.status)
		console.log('Format:', report.format)
		console.log('Period:', `${report.from_date} to ${report.to_date}\n`)

		// Poll for report completion
		console.log('⏳ Waiting for report to be ready...\n')
		let reportDetails = report
		let attempts = 0
		const maxAttempts = 30

		while (reportDetails.status === 'PENDING' && attempts < maxAttempts) {
			await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
			reportDetails = await Report.get(report.id)
			attempts++
			console.log(`Status check ${attempts}/${maxAttempts}: ${reportDetails.status}`)
		}

		if (reportDetails.status === 'READY') {
			console.log('\n✅ Report is ready!')
			console.log('Download URL:', reportDetails.download_url)
			console.log('\n💡 The download URL is pre-signed and will expire.')
		} else if (reportDetails.status === 'FAILED') {
			console.log('\n❌ Report generation failed.')
		} else {
			console.log('\n⏱️ Report is still pending after maximum attempts.')
		}

		// List all reports
		console.log('\n📋 Fetching list of reports...\n')
		const reportsList = await Report.all({ limit: 10 })
		console.log(`Found ${reportsList.list.length} reports:`)
		reportsList.list.forEach((r, index) => {
			console.log(`${index + 1}. ID: ${r.id}`)
			console.log(`   Status: ${r.status}`)
			console.log(`   Period: ${r.from_date} to ${r.to_date}`)
			console.log(`   Created: ${r.created_at}\n`)
		})

		if (reportsList.has_more) {
			console.log('💡 More reports available. Use pagination to fetch them.')
		}
	} catch (error) {
		console.error('❌ Error:', error)
		
		if (error instanceof Error) {
			console.error('Message:', error.message)
			
			// Special authentication error handling
			if (error.message.includes('401') || error.message.includes('403')) {
				console.error('\n⚠️  Authentication Error:')
				console.error('Report APIs require special authentication keys.')
				console.error('Contact tech@satispay.com to enable report access.')
			}
		}
		
		process.exit(1)
	}
}

main()
