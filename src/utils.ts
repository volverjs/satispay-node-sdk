/**
 * Utility functions for Satispay SDK
 * 
 * This module provides helper functions for common operations
 * like amount formatting, date handling, and validation.
 */

/**
 * Amount Utilities
 * Convert between euros and cents (Satispay uses cents)
 */
export const Amount = {
	/**
	 * Convert euros to cents
	 * @param euros Amount in euros (e.g., 10.50)
	 * @returns Amount in cents (e.g., 1050)
	 * @example Amount.toCents(10.50) // 1050
	 */
	toCents(euros: number): number {
		return Math.round(euros * 100)
	},

	/**
	 * Convert cents to euros
	 * @param cents Amount in cents (e.g., 1050)
	 * @returns Amount in euros (e.g., 10.50)
	 * @example Amount.toEuros(1050) // 10.50
	 */
	toEuros(cents: number): number {
		return cents / 100
	},

	/**
	 * Format amount for display
	 * @param cents Amount in cents
	 * @param locale Locale for formatting (default: 'it-IT')
	 * @returns Formatted amount string (e.g., "10,50 €")
	 * @example Amount.format(1050) // "10,50 €"
	 */
	format(cents: number, locale: string = 'it-IT'): string {
		const euros = cents / 100
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: 'EUR',
		}).format(euros)
	},

	/**
	 * Parse formatted amount to cents
	 * @param formatted Formatted amount string (e.g., "10,50 €")
	 * @returns Amount in cents (e.g., 1050)
	 * @example Amount.parse("10,50 €") // 1050
	 */
	parse(formatted: string): number {
		// Remove currency symbols and non-numeric characters except , and .
		const cleaned = formatted.replace(/[^\d,.-]/g, '')
		// Replace comma with dot for decimal separator
		const normalized = cleaned.replace(',', '.')
		const euros = parseFloat(normalized)
		if (isNaN(euros)) {
			throw new Error(`Invalid amount format: ${formatted}`)
		}
		return Math.round(euros * 100)
	},

	/**
	 * Validate amount (must be positive)
	 * @param cents Amount in cents
	 * @returns true if valid, false otherwise
	 */
	isValid(cents: number): boolean {
		return Number.isInteger(cents) && cents > 0
	},
}

/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */
export const DateUtils = {
	/**
	 * Format date for Satispay API (YYYY-MM-DD)
	 * @param date Date object or ISO string
	 * @returns Formatted date string
	 * @example DateUtils.formatForApi(new Date('2024-01-15')) // "2024-01-15"
	 */
	formatForApi(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date
		return d.toISOString().split('T')[0]
	},

	/**
	 * Format date to YYYYMMDD format (for daily closure)
	 * @param date Date object or ISO string
	 * @returns Formatted date string (YYYYMMDD)
	 * @example DateUtils.formatToYYYYMMDD(new Date('2024-01-15')) // "20240115"
	 */
	formatToYYYYMMDD(date: Date | string): string {
		const d = typeof date === 'string' ? new Date(date) : date
		const year = d.getFullYear()
		const month = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return `${year}${month}${day}`
	},

	/**
	 * Parse Satispay date string to Date object
	 * @param dateString Date string from API
	 * @returns Date object
	 */
	parseFromApi(dateString: string): Date {
		return new Date(dateString)
	},

	/**
	 * Get date range for daily closure
	 * @param date Target date
	 * @returns Object with start and end dates
	 */
	getDailyClosureRange(date: Date): { start: Date; end: Date } {
		const start = new Date(date)
		start.setHours(0, 0, 0, 0)

		const end = new Date(date)
		end.setHours(23, 59, 59, 999)

		return { start, end }
	},

	/**
	 * Get today's date at midnight
	 * @returns Today's date at 00:00:00
	 */
	getToday(): Date {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return today
	},

	/**
	 * Get yesterday's date at midnight
	 * @returns Yesterday's date at 00:00:00
	 */
	getYesterday(): Date {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		yesterday.setHours(0, 0, 0, 0)
		return yesterday
	},

	/**
	 * Check if date is today
	 * @param date Date to check
	 * @returns true if date is today
	 */
	isToday(date: Date): boolean {
		const today = this.getToday()
		const checkDate = new Date(date)
		checkDate.setHours(0, 0, 0, 0)
		return checkDate.getTime() === today.getTime()
	},

	/**
	 * Format date for display
	 * @param date Date to format
	 * @param locale Locale for formatting (default: 'it-IT')
	 * @returns Formatted date string
	 */
	format(date: Date | string, locale: string = 'it-IT'): string {
		const d = typeof date === 'string' ? new Date(date) : date
		return new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		}).format(d)
	},

	/**
	 * Format date and time for display
	 * @param date Date to format
	 * @param locale Locale for formatting (default: 'it-IT')
	 * @returns Formatted date and time string
	 */
	formatDateTime(date: Date | string, locale: string = 'it-IT'): string {
		const d = typeof date === 'string' ? new Date(date) : date
		return new Intl.DateTimeFormat(locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		}).format(d)
	},
}

/**
 * Validation Utilities
 * Helper functions for validating common inputs
 */
export const Validation = {
	/**
	 * Validate external code format
	 * @param code External code to validate
	 * @returns true if valid, error message if invalid
	 */
	validateExternalCode(code: string): true | string {
		if (!code || code.trim().length === 0) {
			return 'External code cannot be empty'
		}
		if (code.length > 50) {
			return 'External code must be 50 characters or less'
		}
		// Only alphanumeric, hyphens, and underscores
		if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
			return 'External code can only contain letters, numbers, hyphens, and underscores'
		}
		return true
	},

	/**
	 * Validate payment flow
	 * @param flow Payment flow to validate
	 * @returns true if valid, false otherwise
	 */
	validateFlow(flow: string): boolean {
		return ['MATCH_CODE', 'MATCH_USER', 'REFUND'].includes(flow)
	},

	/**
	 * Validate currency code
	 * @param currency Currency code to validate
	 * @returns true if valid, false otherwise
	 */
	validateCurrency(currency: string): boolean {
		return currency === 'EUR'
	},

	/**
	 * Validate phone number (Italian format)
	 * @param phone Phone number to validate
	 * @returns true if valid, error message if invalid
	 */
	validatePhone(phone: string): true | string {
		// Remove spaces and special characters
		const cleaned = phone.replace(/[\s()-]/g, '')

		// Check Italian mobile format: +39 followed by 9-10 digits
		if (!/^\+39[0-9]{9,10}$/.test(cleaned)) {
			return 'Invalid Italian phone number format. Use +39 followed by 9-10 digits'
		}

		return true
	},

	/**
	 * Validate metadata object
	 * @param metadata Metadata to validate
	 * @returns true if valid, error message if invalid
	 */
	validateMetadata(metadata: Record<string, unknown>): true | string {
		if (!metadata || typeof metadata !== 'object') {
			return 'Metadata must be an object'
		}

		const jsonString = JSON.stringify(metadata)
		if (jsonString.length > 1000) {
			return 'Metadata must be 1000 characters or less when stringified'
		}

		return true
	},
}

/**
 * Code Generator Utilities
 * Helper functions for generating codes and identifiers
 */
export const CodeGenerator = {
	/**
	 * Generate external code with timestamp
	 * @param prefix Optional prefix (default: 'ORDER')
	 * @returns Generated external code
	 * @example CodeGenerator.generateExternalCode() // "ORDER-1704123456789"
	 */
	generateExternalCode(prefix: string = 'ORDER'): string {
		return `${prefix}-${Date.now()}`
	},

	/**
	 * Generate external code with random suffix
	 * @param prefix Optional prefix (default: 'ORDER')
	 * @returns Generated external code
	 * @example CodeGenerator.generateRandomExternalCode() // "ORDER-a1b2c3d4"
	 */
	generateRandomExternalCode(prefix: string = 'ORDER'): string {
		const random = Math.random().toString(36).substring(2, 10)
		return `${prefix}-${random}`
	},

	/**
	 * Generate external code with UUID
	 * @param prefix Optional prefix (default: 'ORDER')
	 * @returns Generated external code
	 * @example CodeGenerator.generateUuidExternalCode() // "ORDER-550e8400-e29b-41d4-a716-446655440000"
	 */
	generateUuidExternalCode(prefix: string = 'ORDER'): string {
		// Simple UUID v4 generator
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0
			const v = c === 'x' ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
		return `${prefix}-${uuid}`
	},
}

/**
 * Payment Status Utilities
 * Helper functions for payment status handling
 */
export const PaymentStatusUtils = {
	/**
	 * Check if payment is pending
	 */
	isPending(status: string): boolean {
		return status === 'PENDING'
	},

	/**
	 * Check if payment is accepted
	 */
	isAccepted(status: string): boolean {
		return status === 'ACCEPTED'
	},

	/**
	 * Check if payment is canceled
	 */
	isCanceled(status: string): boolean {
		return status === 'CANCELED'
	},

	/**
	 * Check if payment is expired
	 */
	isExpired(status: string): boolean {
		return status === 'EXPIRED'
	},

	/**
	 * Check if payment is in final state
	 */
	isFinal(status: string): boolean {
		return ['ACCEPTED', 'CANCELED', 'EXPIRED'].includes(status)
	},

	/**
	 * Get human-readable status
	 */
	getLabel(status: string, locale: string = 'it-IT'): string {
		const labels: Record<string, Record<string, string>> = {
			'it-IT': {
				PENDING: 'In attesa',
				ACCEPTED: 'Accettato',
				CANCELED: 'Annullato',
				EXPIRED: 'Scaduto',
			},
			'en-US': {
				PENDING: 'Pending',
				ACCEPTED: 'Accepted',
				CANCELED: 'Canceled',
				EXPIRED: 'Expired',
			},
		}

		return labels[locale]?.[status] || status
	},
}
