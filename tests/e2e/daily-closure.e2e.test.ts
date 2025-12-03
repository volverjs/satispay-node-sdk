import { describe, it, expect } from 'vitest'
import { DailyClosure } from '../../src/DailyClosure'
import { canRunE2ETests, hasAuthenticationKeys } from '../setup'

/**
 * E2E tests for Daily Closure with Satispay
 * 
 * These tests require:
 * - SATISPAY_PUBLIC_KEY, SATISPAY_PRIVATE_KEY, SATISPAY_KEY_ID configured
 * - Staging or test environment
 */

describe.skipIf(!canRunE2ETests() || !hasAuthenticationKeys())('E2E: Daily Closure', () => {
	describe('Get Daily Closure', () => {
		it('should get today\'s daily closure', async () => {
			const closure = await DailyClosure.get()

			expect(closure).toBeDefined()
			expect(closure.shop_daily_closure).toBeDefined()
			expect(closure.device_daily_closure).toBeDefined()
			
			// Validate shop_daily_closure structure
			expect(closure.shop_daily_closure.id).toBeDefined()
			expect(closure.shop_daily_closure.type).toBeDefined()
			expect(closure.shop_daily_closure.customer_uid).toBeDefined()
			expect(typeof closure.shop_daily_closure.amount_unit).toBe('number')
			expect(typeof closure.shop_daily_closure.gross_amount_unit).toBe('number')
			expect(typeof closure.shop_daily_closure.refund_amount_unit).toBe('number')
			expect(closure.shop_daily_closure.currency).toBe('EUR')
			
			// Validate device_daily_closure structure
			expect(closure.device_daily_closure.id).toBeDefined()
			expect(closure.device_daily_closure.type).toBeDefined()
			expect(closure.device_daily_closure.customer_uid).toBeDefined()
			expect(typeof closure.device_daily_closure.amount_unit).toBe('number')
			expect(typeof closure.device_daily_closure.gross_amount_unit).toBe('number')
			expect(typeof closure.device_daily_closure.refund_amount_unit).toBe('number')
			expect(closure.device_daily_closure.currency).toBe('EUR')
			
			console.log('\n📊 Today\'s Daily Closure:')
			console.log(`Date: ${closure.shop_daily_closure.id}`)
			console.log(`Shop Amount: ${closure.shop_daily_closure.amount_unit / 100} ${closure.shop_daily_closure.currency}`)
			console.log(`Device Amount: ${closure.device_daily_closure.amount_unit / 100} ${closure.device_daily_closure.currency}`)
		}, 30000)

		it('should get daily closure using Date object', async () => {
			const today = new Date()
			const closure = await DailyClosure.get(today)

			expect(closure).toBeDefined()
			expect(closure.shop_daily_closure).toBeDefined()
			expect(closure.device_daily_closure).toBeDefined()
			
			// Verify the date matches today's format (YYYYMMDD)
			const expectedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
			expect(closure.shop_daily_closure.id).toBe(expectedDate)
			
			console.log('\n📊 Daily Closure (using Date object):')
			console.log(`Date: ${closure.shop_daily_closure.id}`)
			console.log(`Shop Amount: ${closure.shop_daily_closure.amount_unit / 100} ${closure.shop_daily_closure.currency}`)
		}, 30000)

		it('should get daily closure using string date (YYYYMMDD)', async () => {
			const today = new Date()
			const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
			
			const closure = await DailyClosure.get(dateString)

			expect(closure).toBeDefined()
			expect(closure.shop_daily_closure).toBeDefined()
			expect(closure.shop_daily_closure.id).toBe(dateString)
			
			console.log('\n📊 Daily Closure (using string date):')
			console.log(`Date: ${closure.shop_daily_closure.id}`)
			console.log(`Shop Amount: ${closure.shop_daily_closure.amount_unit / 100} ${closure.shop_daily_closure.currency}`)
		}, 30000)

		it('should get yesterday\'s daily closure', async () => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			
			const closure = await DailyClosure.get(yesterday)

			expect(closure).toBeDefined()
			expect(closure.shop_daily_closure).toBeDefined()
			
			const expectedDate = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`
			expect(closure.shop_daily_closure.id).toBe(expectedDate)
			
			console.log('\n📊 Yesterday\'s Daily Closure:')
			console.log(`Date: ${closure.shop_daily_closure.id}`)
			console.log(`Shop Amount: ${closure.shop_daily_closure.amount_unit / 100} ${closure.shop_daily_closure.currency}`)
			console.log(`Shop Gross: ${closure.shop_daily_closure.gross_amount_unit / 100}`)
			console.log(`Shop Refunds: ${closure.shop_daily_closure.refund_amount_unit / 100}`)
		}, 30000)

		it('should validate amounts calculation', async () => {
			const closure = await DailyClosure.get()

			// Verify that amount_unit = gross_amount_unit - refund_amount_unit
			const shopCalculated = closure.shop_daily_closure.gross_amount_unit - closure.shop_daily_closure.refund_amount_unit
			expect(closure.shop_daily_closure.amount_unit).toBe(shopCalculated)
			
			const deviceCalculated = closure.device_daily_closure.gross_amount_unit - closure.device_daily_closure.refund_amount_unit
			expect(closure.device_daily_closure.amount_unit).toBe(deviceCalculated)
			
			console.log('\n✅ Amount calculation verified:')
			console.log(`Shop: ${closure.shop_daily_closure.gross_amount_unit} - ${closure.shop_daily_closure.refund_amount_unit} = ${closure.shop_daily_closure.amount_unit}`)
			console.log(`Device: ${closure.device_daily_closure.gross_amount_unit} - ${closure.device_daily_closure.refund_amount_unit} = ${closure.device_daily_closure.amount_unit}`)
		}, 30000)
	})
})
