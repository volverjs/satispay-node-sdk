import { describe, it, expect } from 'vitest'
import {
	Amount,
	DateUtils,
	Validation,
	CodeGenerator,
	PaymentStatusUtils,
} from '../src/utils'

describe('Amount', () => {
	describe('toCents', () => {
		it('should convert euros to cents', () => {
			expect(Amount.toCents(10.5)).toBe(1050)
			expect(Amount.toCents(1)).toBe(100)
			expect(Amount.toCents(0.01)).toBe(1)
		})

		it('should round to nearest cent', () => {
			expect(Amount.toCents(10.505)).toBe(1051)
			expect(Amount.toCents(10.504)).toBe(1050)
		})
	})

	describe('toEuros', () => {
		it('should convert cents to euros', () => {
			expect(Amount.toEuros(1050)).toBe(10.5)
			expect(Amount.toEuros(100)).toBe(1)
			expect(Amount.toEuros(1)).toBe(0.01)
		})
	})

	describe('format', () => {
		it('should format amount with default locale', () => {
			const formatted = Amount.format(1050)
			expect(formatted).toContain('10')
			expect(formatted).toContain('50')
		})

		it('should format amount with custom locale', () => {
			const formatted = Amount.format(1050, 'en-US')
			expect(formatted).toContain('10')
			expect(formatted).toContain('50')
		})
	})

	describe('parse', () => {
		it('should parse formatted amount', () => {
			expect(Amount.parse('10,50 €')).toBe(1050)
			expect(Amount.parse('10.50')).toBe(1050)
			expect(Amount.parse('1,00')).toBe(100)
		})

		it('should throw error on invalid format', () => {
			expect(() => Amount.parse('invalid')).toThrow('Invalid amount format')
		})
	})

	describe('isValid', () => {
		it('should validate positive integers', () => {
			expect(Amount.isValid(100)).toBe(true)
			expect(Amount.isValid(1)).toBe(true)
		})

		it('should reject invalid amounts', () => {
			expect(Amount.isValid(0)).toBe(false)
			expect(Amount.isValid(-100)).toBe(false)
			expect(Amount.isValid(10.5)).toBe(false)
		})
	})
})

describe('DateUtils', () => {
	describe('formatForApi', () => {
		it('should format Date object', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			expect(DateUtils.formatForApi(date)).toBe('2024-01-15')
		})

		it('should format ISO string', () => {
			expect(DateUtils.formatForApi('2024-01-15T10:30:00Z')).toBe('2024-01-15')
		})
	})

	describe('formatToYYYYMMDD', () => {
		it('should format Date object to YYYYMMDD', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			expect(DateUtils.formatToYYYYMMDD(date)).toBe('20240115')
		})

		it('should format ISO string to YYYYMMDD', () => {
			expect(DateUtils.formatToYYYYMMDD('2024-01-15T10:30:00Z')).toBe('20240115')
		})

		it('should pad single digit months and days', () => {
			const date = new Date('2024-03-05T10:30:00Z')
			expect(DateUtils.formatToYYYYMMDD(date)).toBe('20240305')
		})
	})

	describe('parseFromApi', () => {
		it('should parse date string', () => {
			const date = DateUtils.parseFromApi('2024-01-15T10:30:00Z')
			expect(date).toBeInstanceOf(Date)
			expect(date.getFullYear()).toBe(2024)
			expect(date.getMonth()).toBe(0)
			expect(date.getDate()).toBe(15)
		})
	})

	describe('getDailyClosureRange', () => {
		it('should return start and end of day', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			const range = DateUtils.getDailyClosureRange(date)

			expect(range.start.getHours()).toBe(0)
			expect(range.start.getMinutes()).toBe(0)
			expect(range.start.getSeconds()).toBe(0)

			expect(range.end.getHours()).toBe(23)
			expect(range.end.getMinutes()).toBe(59)
			expect(range.end.getSeconds()).toBe(59)
		})
	})

	describe('getToday', () => {
		it('should return today at midnight', () => {
			const today = DateUtils.getToday()
			expect(today.getHours()).toBe(0)
			expect(today.getMinutes()).toBe(0)
			expect(today.getSeconds()).toBe(0)
		})
	})

	describe('getYesterday', () => {
		it('should return yesterday at midnight', () => {
			const yesterday = DateUtils.getYesterday()
			const expectedDate = new Date()
			expectedDate.setDate(expectedDate.getDate() - 1)
			expectedDate.setHours(0, 0, 0, 0)
			
			expect(yesterday.getDate()).toBe(expectedDate.getDate())
			expect(yesterday.getHours()).toBe(0)
		})
	})

	describe('isToday', () => {
		it('should check if date is today', () => {
			const today = new Date()
			expect(DateUtils.isToday(today)).toBe(true)

			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			expect(DateUtils.isToday(yesterday)).toBe(false)
		})
	})

	describe('format', () => {
		it('should format date with default locale', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			const formatted = DateUtils.format(date)
			expect(formatted).toBeTruthy()
		})

		it('should format date with custom locale', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			const formatted = DateUtils.format(date, 'en-US')
			expect(formatted).toContain('January')
		})
	})

	describe('formatDateTime', () => {
		it('should format date and time', () => {
			const date = new Date('2024-01-15T10:30:00Z')
			const formatted = DateUtils.formatDateTime(date)
			expect(formatted).toBeTruthy()
		})
	})
})

describe('Validation', () => {
	describe('validateExternalCode', () => {
		it('should validate correct external codes', () => {
			expect(Validation.validateExternalCode('ORDER-123')).toBe(true)
			expect(Validation.validateExternalCode('test_code')).toBe(true)
			expect(Validation.validateExternalCode('ABC123')).toBe(true)
		})

		it('should reject empty codes', () => {
			expect(Validation.validateExternalCode('')).toContain('cannot be empty')
			expect(Validation.validateExternalCode('   ')).toContain('cannot be empty')
		})

		it('should reject too long codes', () => {
			const longCode = 'a'.repeat(51)
			expect(Validation.validateExternalCode(longCode)).toContain('50 characters')
		})

		it('should reject invalid characters', () => {
			expect(Validation.validateExternalCode('code with spaces')).toContain(
				'letters, numbers'
			)
			expect(Validation.validateExternalCode('code@invalid')).toContain(
				'letters, numbers'
			)
		})
	})

	describe('validateFlow', () => {
		it('should validate correct flows', () => {
			expect(Validation.validateFlow('MATCH_CODE')).toBe(true)
			expect(Validation.validateFlow('MATCH_USER')).toBe(true)
			expect(Validation.validateFlow('REFUND')).toBe(true)
		})

		it('should reject invalid flows', () => {
			expect(Validation.validateFlow('INVALID')).toBe(false)
			expect(Validation.validateFlow('')).toBe(false)
		})
	})

	describe('validateCurrency', () => {
		it('should validate EUR', () => {
			expect(Validation.validateCurrency('EUR')).toBe(true)
		})

		it('should reject other currencies', () => {
			expect(Validation.validateCurrency('USD')).toBe(false)
			expect(Validation.validateCurrency('GBP')).toBe(false)
		})
	})

	describe('validatePhone', () => {
		it('should validate Italian phone numbers', () => {
			expect(Validation.validatePhone('+393331234567')).toBe(true)
			expect(Validation.validatePhone('+39 333 123 4567')).toBe(true)
		})

		it('should reject invalid phone numbers', () => {
			expect(Validation.validatePhone('123456789')).toContain('Invalid')
			expect(Validation.validatePhone('+1234567890')).toContain('Invalid')
		})
	})

	describe('validateMetadata', () => {
		it('should validate correct metadata', () => {
			expect(Validation.validateMetadata({ key: 'value' })).toBe(true)
			expect(Validation.validateMetadata({ a: 1, b: 'test' })).toBe(true)
		})

		it('should reject non-object metadata', () => {
			expect(Validation.validateMetadata(null as any)).toContain('must be an object')
			expect(Validation.validateMetadata('string' as any)).toContain('must be an object')
		})

		it('should reject too large metadata', () => {
			const largeMetadata = { data: 'a'.repeat(1000) }
			expect(Validation.validateMetadata(largeMetadata)).toContain('1000 characters')
		})
	})
})

describe('CodeGenerator', () => {
	describe('generateExternalCode', () => {
		it('should generate code with timestamp', () => {
			const code = CodeGenerator.generateExternalCode()
			expect(code).toMatch(/^ORDER-\d+$/)
		})

		it('should use custom prefix', () => {
			const code = CodeGenerator.generateExternalCode('PAYMENT')
			expect(code).toMatch(/^PAYMENT-\d+$/)
		})
	})

	describe('generateRandomExternalCode', () => {
		it('should generate code with random suffix', () => {
			const code = CodeGenerator.generateRandomExternalCode()
			expect(code).toMatch(/^ORDER-[a-z0-9]+$/)
		})

		it('should use custom prefix', () => {
			const code = CodeGenerator.generateRandomExternalCode('TEST')
			expect(code).toMatch(/^TEST-[a-z0-9]+$/)
		})

		it('should generate unique codes', () => {
			const code1 = CodeGenerator.generateRandomExternalCode()
			const code2 = CodeGenerator.generateRandomExternalCode()
			expect(code1).not.toBe(code2)
		})
	})

	describe('generateUuidExternalCode', () => {
		it('should generate UUID code', () => {
			const code = CodeGenerator.generateUuidExternalCode()
			expect(code).toMatch(/^ORDER-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
		})

		it('should use custom prefix', () => {
			const code = CodeGenerator.generateUuidExternalCode('INVOICE')
			expect(code).toMatch(/^INVOICE-[0-9a-f]{8}-/)
		})

		it('should generate unique codes', () => {
			const code1 = CodeGenerator.generateUuidExternalCode()
			const code2 = CodeGenerator.generateUuidExternalCode()
			expect(code1).not.toBe(code2)
		})
	})
})

describe('PaymentStatusUtils', () => {
	describe('status checkers', () => {
		it('should check if payment is pending', () => {
			expect(PaymentStatusUtils.isPending('PENDING')).toBe(true)
			expect(PaymentStatusUtils.isPending('ACCEPTED')).toBe(false)
		})

		it('should check if payment is accepted', () => {
			expect(PaymentStatusUtils.isAccepted('ACCEPTED')).toBe(true)
			expect(PaymentStatusUtils.isAccepted('PENDING')).toBe(false)
		})

		it('should check if payment is canceled', () => {
			expect(PaymentStatusUtils.isCanceled('CANCELED')).toBe(true)
			expect(PaymentStatusUtils.isCanceled('PENDING')).toBe(false)
		})

		it('should check if payment is expired', () => {
			expect(PaymentStatusUtils.isExpired('EXPIRED')).toBe(true)
			expect(PaymentStatusUtils.isExpired('PENDING')).toBe(false)
		})

		it('should check if payment is final', () => {
			expect(PaymentStatusUtils.isFinal('ACCEPTED')).toBe(true)
			expect(PaymentStatusUtils.isFinal('CANCELED')).toBe(true)
			expect(PaymentStatusUtils.isFinal('EXPIRED')).toBe(true)
			expect(PaymentStatusUtils.isFinal('PENDING')).toBe(false)
		})
	})

	describe('getLabel', () => {
		it('should return Italian labels by default', () => {
			expect(PaymentStatusUtils.getLabel('PENDING')).toBe('In attesa')
			expect(PaymentStatusUtils.getLabel('ACCEPTED')).toBe('Accettato')
			expect(PaymentStatusUtils.getLabel('CANCELED')).toBe('Annullato')
			expect(PaymentStatusUtils.getLabel('EXPIRED')).toBe('Scaduto')
		})

		it('should return English labels', () => {
			expect(PaymentStatusUtils.getLabel('PENDING', 'en-US')).toBe('Pending')
			expect(PaymentStatusUtils.getLabel('ACCEPTED', 'en-US')).toBe('Accepted')
			expect(PaymentStatusUtils.getLabel('CANCELED', 'en-US')).toBe('Canceled')
			expect(PaymentStatusUtils.getLabel('EXPIRED', 'en-US')).toBe('Expired')
		})

		it('should return status as-is for unknown status', () => {
			expect(PaymentStatusUtils.getLabel('UNKNOWN')).toBe('UNKNOWN')
		})
	})
})
